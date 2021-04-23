const { Schema, model } = require('mongoose');

const premiumSchema = Schema({
	// ID of User or Guild
	ID: String,
	// User or Guild
	Type: String,
	// when premium started
	premiumSince: String,
	// set to 0 if premium forever
	premiumTill: String,
});

module.exports = model('Premium', premiumSchema);
