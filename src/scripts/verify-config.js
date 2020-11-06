const logger = require('../modules/logging/logger');
const chalk = require('chalk');
const fetch = require('node-fetch');

module.exports.run = async (config) => {
	// This will check if the config is correct
	logger.log('=-=-=-=-=-=-=- Config file Verification -=-=-=-=-=-=-=');
	logger.log('Verifing config..');
	let error;
	// check owner ID
	if (!config.ownerID) {
		logger.error(`${chalk.red('✗')} Bot ownerID is missing.`);
		error = true;
	}

	// check token
	if (!config.token) {
		logger.error(`${chalk.red('✗')} Bot token is missing.`);
		error = true;
	}

	// Check twitch API
	if (!config.TwitchAPI) {
		logger.error(`${chalk.red('✗')} Twitch API key is missing.`);
		error = true;
	}

	// Check fortnite API
	if (!config.fortniteAPI) {
		logger.error(`${chalk.red('✗')} Fortnite API key is missing.`);
		error = true;
	}

	// Check Ksoft API
	if (!config.KSoftSiAPI) {
		logger.error(`${chalk.red('✗')} Ksoft API key is missing.`);
		error = true;
	}

	// Check Steam API
	if (!config.SteamAPI) {
		logger.error(`${chalk.red('✗')} Steam API key is missing.`);
		error = true;
	}

	// Check Youtube API
	if (!config.YoutubeAPI_Key) {
		logger.error(`${chalk.red('✗')} Youtube API key is missing.`);
		error = true;
	}

	// Check Soundcloud API
	if (!config.soundcloudAPI_Key) {
		logger.error(`${chalk.red('✗')} Soundcloud API key is missing.`);
		error = true;
	}

	// Check for bot list API keys
	if (config.DiscordBotLists) {
		// Check discord api
		if (!config.DiscordBotLists.DiscordBoatAPI_Key) {
			logger.log(`${chalk.red('✓')} Discord Boat API key is missing.`);
			error = true;
		}
		if (!config.DiscordBotLists.ArcaneBotAPI_KEY) {
			logger.log(`${chalk.red('✓')} Arcane Bot API key is missing.`);
			error = true;
		}
		if (!config.DiscordBotLists.botlist_spaceAPI_KEY) {
			logger.log(`${chalk.red('✓')} Botlist Space API key is missing.`);
			error = true;
		}
	}

	// Check Amethyste API
	if (!config.amethysteAPI_KEY) {
		logger.error(`${chalk.red('✗')} Amethyste API key is missing.`);
		error = true;
	} else {
		const res = await fetch('https://v1.api.amethyste.moe/generate/blurple', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${config.amethysteAPI_KEY}`,
			},
		});
		const result = await res.json();
		if (result.status === 401) {
			logger.error(`${chalk.red('✗')} Invalid Amethyste API key.`);
			error = true;
		}
	}

	// Check Rainbow 6 API
	if (!config.Rainbow6Siege) {
		logger.error(`${chalk.red('✗')} Rainbow 6 API key is missing.`);
		error = true;
	} else if (!config.Rainbow6Siege.username) {
		logger.error(`${chalk.red('✗')} Rainbow 6 username is missing.`);
		error = true;
	} else if (!config.Rainbow6Siege.password) {
		logger.error(`${chalk.red('✗')} Rainbow 6 password is missing.`);
		error = true;
	}

	// Check dashbaord
	if (!config.Dashboard) {
		logger.error(`${chalk.red('✗')} Dashboard setup is missing.`);
		error = true;
	}

	// Check support server set up
	if (!config.SupportServer) {
		logger.error(`${chalk.red('✗')} Support server setup is missing.`);
		error = true;
	}

	// Check fall back server settings setup
	if (!config.defaultSettings) {
		logger.error(`${chalk.red('✗')} Fallback server settings is missing.`);
		error = true;
	}

	// Check custom emojis
	if (!config.emojis) {
		logger.error(`${chalk.red('✗')} Custom emoji list is missing.`);
		error = true;
	}
	// Check mongodb connection
	if (!config.MongoDBURl) {
		logger.error(`${chalk.red('✗')} MongoDB URl is missing.`);
		error = true;
	} else {
		const mongoose = require('mongoose');
		await mongoose.connect(config.MongoDBURl, { useUnifiedTopology: true, useNewUrlParser: true }).catch(() => {
			logger.log(`${chalk.red('✗')} Unable to connect to database.`);
			error = true;
		});
	}

	// Check default language
	if (!config.DefaultLanguage) {
		logger.error(`${chalk.red('✗')} Default language is missing.`);
		error = true;
	}

	// keep at end
	if (error != true) {
		logger.log(`${chalk.green('✓')} Config has been verified.`);
		error = false;
		return error;
	} else {
		logger.error(`${chalk.red('✗')} Config has errors to fix.`);
		return error;
	}
};
