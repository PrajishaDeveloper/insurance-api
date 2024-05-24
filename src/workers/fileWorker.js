const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const Agent = require('../models/Agent');
const User = require('../models/User');
const Account = require('../models/Account');
const Policy = require('../models/Policy');
const Carrier = require('../models/Carrier');
require('dotenv').config();
const MONGODB_URI='mongodb://localhost:27017/insuranceDB';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => {
    parentPort.postMessage({ error: error.message });
});
db.once('open', () => {
    processFile(workerData.filePath);
});

async function processFile(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;

        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        //console.log('666666666666666666',data);

        for (const row of data) {
            const agent = new Agent({ name: row['agent'] });
            await agent.save();
            const user = new User({
                firstName: row['firstname'],
                dob: new Date(row['dob']),
                address: row['address'],
                phoneNumber: row['phone'],
                state: row['state'],
                zipCode: row['zip'],
                email: row['email'],
                gender: row['gender'],
                userType: row['userType']
            });
            await user.save();
            const account = new Account({ accountName: row['account_name'] });
            await account.save();
            const carrier = new Carrier({ companyName: row['company_name'] });
            await carrier.save();

            const policy = new Policy({
                policyNumber: row['policy_number'],
                policyStartDate: new Date(row['policy_start_date']),
                policyEndDate: new Date(row['policy_end_date']),
                userId: user._id
            });
            await policy.save();
        }

        fs.unlinkSync(filePath);
        parentPort.postMessage({ message: 'File processed successfully' });
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    } finally {
        mongoose.connection.close();
    }
}
