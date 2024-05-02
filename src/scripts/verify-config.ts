// Dependencies
import { Logger } from '../utils';
import chalk from 'chalk';
import mongoose from 'mongoose';
import { Client, GatewayIntentBits } from 'discord.js';
import Config from '../config';
import axios from 'axios';
const logger = new Logger();

export async function validateConfig(config: typeof Config) {
	// This will check if the config is correct
	logger.log('=-=-=-=-=-=-=- Config file Verification -=-=-=-=-=-=-=');
	logger.log('Verifying config..');

	// Make sure Node.js V18 or higher is being ran.
	const nodeVersion = parseFloat(process.version.slice(1));
	if (nodeVersion < 18) {
		// Node version is less than v16
		logger.error(`${chalk.red('✗')} Node version 16.13 minimum.`);
		return true;
	}

	// check owner ID array
	if (config.ownerID.length !== 0) {
		// validate owner ID's
		for (const owner of config.ownerID) {
			if (!owner.match(/(\d{17,19})/g)) {
				logger.error(`${chalk.red('✗')} ownerID: ${owner} is invalid.`);
				return true;
			}
		}
	} else {
		logger.error(`${chalk.red('✗')} client ownerID array is missing.`);
		return true;
	}

	// check token
	if (!config.token) {
		logger.error(`${chalk.red('✗')} client token is missing.`);
		return true;
	} else {
		logger.log('Checking client details..');
		const client = new Client({ intents: [GatewayIntentBits.Guilds] });

		// Check for a discord error, if any
		try {
			await client.login(config.token);
			client.destroy();
			logger.ready(`${chalk.green('✓')} Client successfully logged in.`);
		} catch (e: any) {
			switch (e.message) {
				case 'An invalid token was provided.':
					logger.error(`${chalk.red('✗')} client token is incorrect.`);
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
			await mongoose.connect(config.MongoDBURl);
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
			await axios.get('https://api.egglord.dev/api/info/validate', {
				headers: { 'Authorization': config.api_keys.masterToken },
			});
			logger.ready(`${chalk.green('✓')} API is online`);
		} catch (e: any) {
			switch (e.response.status) {
				case 403:
					logger.error(`${chalk.red('✗')} Master API token is incorrect. Get it here: https://api.egglord.dev/`);
					break;
				case 502:
				case 522:
					logger.error(`${chalk.red('✗')} API server is currently offline.`);
					break;
			}
			return true;
		}
	}
}