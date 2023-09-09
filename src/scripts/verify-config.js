// Dependencies
const { logger } = require('../utils'),
	chalk = require('chalk'),
	mongoose = require('mongoose'),
	{ Client, GatewayIntentBits: FLAGS } = require('discord.js');

async function validateConfig(config) {
	// This will check if the config is correct
	logger.log('=-=-=-=-=-=-=- Config file Verification -=-=-=-=-=-=-=');
	logger.log('Verifying config..');

	// Make sure Node.js V16 or higher is being ran.
	const nodeVersion = process.version.slice(1).split('.');
	if (nodeVersion[0] < 16) {
		// Node version is less than v16
		logger.error(`${chalk.red('✗')} Node version 16.13 minimum.`);
		return true;
	} else if (nodeVersion[0] < 16 & nodeVersion[1] < 13) {
		logger.error(`${chalk.red('✗')} Node version 16.13 minimum.`);
		return true;
	}

	// check owner ID array
	if (config.ownerID) {
		// validate owner ID's
		for (const owner of config.ownerID) {
			if (isNaN(owner)) {
				logger.error(`${chalk.red('✗')} ownerID: ${owner} is invalid.`);
				return true;
			}
		}
	} else {
		logger.error(`${chalk.red('✗')} Bot ownerID array is missing.`);
		return true;
	}

	// check token
	if (!config.token) {
		logger.error(`${chalk.red('✗')} Bot token is missing.`);
		return true;
	} else {
		logger.log('Checking client details..');
		const client = new Client({ intents: [FLAGS.Guilds] });

		// Check for a discord error, if any
		try {
			await client.login(config.token);
			client.destroy();
			logger.ready(`${chalk.green('✓')} Client successfully logged in.`);
		} catch (e) {
			switch (e.message) {
				case 'An invalid token was provided.':
					logger.error(`${chalk.red('✗')} Bot token is incorrect.`);
					return true;
				case 'Privileged intent provided is not enabled or whitelisted.':
					logger.error(`${chalk.red('✗')} You need to enable privileged intents on the discord developer page.`);
					return true;
				default:
					logger.error(`${JSON.stringify(e.message)}`);
					return true;
			}
		}
	}

	// Check support server set up
	if (!config.SupportServer) {
		logger.error(`${chalk.red('✗')} Support server setup is missing.`);
	}

	// Check mongodb connection
	if (!config.MongoDBURl) {
		logger.error(`${chalk.red('✗')} MongoDB URL is missing.`);
		return true;
	} else {
		try {
			logger.log('Checking MongoDB URL');
			await mongoose.connect(config.MongoDBURl, { useUnifiedTopology: true, useNewUrlParser: true });
			mongoose.disconnect();
			logger.ready(`${chalk.green('✓')} MongoDB successfully connected.`);
		} catch (err) {
			console.log(err);
			logger.error(`${chalk.red('✗')} Unable to connect to database.`);
			return true;
		}
	}

	if (config.api_keys.masterToken) {
		try {
			await require('axios').get('https://api.egglord.dev/api/info/validate', {
				headers: { 'Authorization': config.api_keys.masterToken },
			});
			logger.ready(`${chalk.green('✓')} API is online`);
		} catch (e) {
			switch (e.response.status) {
				case 403:
					logger.error(`${chalk.red('✗')} Master API token is incorrect. Get it here: https://api.egglord.dev/`);
					return true;
				case 502:
					logger.error(`${chalk.red('✗')} API server is currently offline.`);
					break;
			}
		}
	}
}

module.exports = validateConfig;
