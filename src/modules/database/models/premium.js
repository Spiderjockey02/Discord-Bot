const mongoose = require('mongoose');

const premiumSchema = mongoose.Schema({
	userID: String,
	premium: Boolean,
	premiumSince: String,
});

module.exports = mongoose.model('Premium', premiumSchema);
