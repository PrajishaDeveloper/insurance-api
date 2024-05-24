const mongoose = require('mongoose');

const carrierSchema = new mongoose.Schema({
    companyName: String
});

module.exports = mongoose.model('Carrier', carrierSchema);
