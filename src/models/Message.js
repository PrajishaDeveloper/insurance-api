const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: String,
  scheduledTime: Date
});

module.exports = mongoose.model('Message', messageSchema);
