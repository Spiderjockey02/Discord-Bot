const { Schema, model } = require('mongoose');

const premiumSchema = Schema({
	userID: String,
	premium: Boolean,
	premiumSince: String,
});

module.exports = model('Premium', premiumSchema);
