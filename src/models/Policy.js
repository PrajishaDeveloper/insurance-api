const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    policyNumber: String,
    policyStartDate: Date,
    policyEndDate: Date,
    policyCategoryCollectionId: String,
    companyCollectionId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Policy', policySchema);
