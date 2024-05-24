const express = require('express');
const mongoose = require('mongoose');
const { Worker } = require('worker_threads');
const multer = require('multer');
require('dotenv').config();
const os = require('os');
const { exec } = require('child_process');
const Message = require('./models/Message');
const userController = require('./controllers/userController');

const app = express();
const port = process.env.PORT || 6000;

// MongoDB Connection
const MONGODB_URI='mongodb://localhost:27017/insuranceDB';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


app.use(express.json());

// File upload and worker thread for processing
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    const worker = new Worker('./workers/fileWorker.js', {
        workerData: {
            filePath: req.file.path
        }
    });

    worker.on('message', (message) => {
        res.status(200).json(message);
    });

    worker.on('error', (error) => {
        res.status(500).json({ error: error.message });
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: `Worker stopped with exit code ${code}` });
        }
    });
});

app.get('/policies', userController.findUserPolicies);
app.get('/aggregate/policies', userController.aggregatePoliciesByUser);

//message

app.post('/schedule-message', async (req, res) => {
    const { message, day, time } = req.body;
    const scheduledTime = new Date(`${day} ${time}`);
  
    try {
      const newMessage = new Message({ message, scheduledTime });
      await newMessage.save();
      res.status(200).json({ status: 'success', message: 'Message scheduled successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//cpu usage

const checkCPUUsage = () => {
    console.log('checkCPUUsage');
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
  
    cpus.forEach(cpu => {
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
  
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
  
    const usage = (1 - idle / total) * 100;
  
    if (usage > 70) {
    console.log('CPU usage exceeded 70%. Restarting server...');
      exec('pm2 restart all -f', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    }
  };
  
  setInterval(checkCPUUsage, 5000); // Check every 5 seconds

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
