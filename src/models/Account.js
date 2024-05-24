const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountName: String
});

module.exports = mongoose.model('Account', accountSchema);
