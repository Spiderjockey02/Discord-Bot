// Dependecies
const { Client, Collection } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	mongoose = require('mongoose'),
	GiveawaysManager = require('./giveaway/Manager'),
	Fortnite = require('fortnite'),
	{ KSoftClient } = require('@ksoft/api'),
	path = require('path');

// Creates Egglord class
module.exports = class Egglord extends Client {
	constructor(options) {
		super(options);
		// for console logging
		this.logger = require('../utils/logger');

		// Giveaway manager
		this.giveawaysManager = new GiveawaysManager(this, {
			storage: false,
			updateCountdownEvery: 10000,
			// giveaways are deleted 1 week after end
			endedGiveawaysLifetime: 604800000,
			default: {
				botsCanWin: false,
				exemptPermissions: [],
				embedColor: '#FF0000',
				reaction: '🎉',
			},
		});

		// For command handler
		this.aliases = new Collection();
		this.commands = new Collection();
		this.cooldowns = new Collection();

		// connect to database
		this.mongoose = require('../database/mongoose');

		// config file
		this.config = require('../config.js');

		// for Activity
		this.Activity = [];
		this.PresenceType = 'PLAYING';

		// for KSOFT API
		this.Ksoft = new KSoftClient(this.config.api_keys.ksoft);

		// for Fortnite API
		this.Fortnite = new Fortnite(this.config.api_keys.fortnite);

		// Basic statistics for the bot
		this.messagesSent = 0;
		this.commandsUsed = 0;

		// for Screenshot command
		this.adultSiteList = null;

		// for time converting and stuff
		this.timeFormatter = new (require('../utils/timeFormatter'));
	}

	// when the this joins add guild settings to server
	async CreateGuild(settings) {
		const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, settings);
		const newGuild = await new GuildSchema(merged);
		return newGuild.save();
	}

	// Delete guild from server when this leaves server
	async DeleteGuild(guild) {
		await GuildSchema.findOneAndRemove({ guildID: guild.id }, (err) => {
			if (err) console.log(err);
		});
		return;
	}

	// Fetch user ID from discord API
	async getUser(ID) {
		try {
			const user = await this.users.fetch(ID);
			return user;
		} catch (err) {
			console.log(err.message);
			return false;
		}
	}

	// Get a channel in cache
	async getChannel(id) {
		try {
			const channel = await this.channels.cache.get(id);
			return channel;
		} catch (err) {
			console.log(err.message);
			return false;
		}
	}

	// Set this's status
	async SetStatus(status = 'online') {
		try {
			await this.user.setStatus(status);
			return;
		} catch (err) {
			console.log(err.message);
			return false;
		}
	}

	// Set this's activity
	SetActivity(array = [], type) {
		this.Activity = array;
		this.PresenceType = type;
		try {
			let j = 0;
			setInterval(() => this.user.setActivity(`${this.Activity[j++ % this.Activity.length]}`, { type: type, url: 'https://www.twitch.tv/yassuo' }), 10000);
			return;
		} catch (e) {
			console.log(e);
		}
	}

	// Load a command
	loadCommand(commandPath, commandName) {
		try {
			const cmd = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
			this.logger.log(`Loading Command: ${cmd.help.name}.`);
			cmd.conf.location = commandPath;
			if (cmd.init) cmd.init(this);
			this.commands.set(cmd.help.name, cmd);
			cmd.help.aliases.forEach((alias) => {
				this.aliases.set(alias, cmd.help.name);
			});
			return false;
		} catch (err) {
			return `Unable to load command ${commandName}: ${err}`;
		}
	}

	// Unload a command (you need to load them again)
	async unloadCommand(commandPath, commandName) {
		let command;
		if (this.commands.has(commandName)) {
			command = this.commands.get(commandName);
		} else if (this.aliases.has(commandName)) {
			command = this.commands.get(this.aliases.get(commandName));
		}
		if(!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		if(command.shutdown) await command.shutdown(this);
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
	}

	// Fetches adult sites for screenshot NSFW blocking
	async fetchAdultSiteList() {
		const blockedWebsites = require('../assets/json/NSFW_websites.json');
		this.adultSiteList = blockedWebsites.websites;
		return this.adultSiteList;
	}

	// This will get the translation for the provided text
	translate(language, key, args) {
		let languageFile;
		if (key.includes('/')) {
			const word = key.split('/');
			languageFile = require(`../languages/${language}/${word[0]}/translation`);
			return languageFile(word[1], args);
		} else {
			languageFile = require(`../languages/${language}/misc`);
			return languageFile(key, args);
		}
	}
};
