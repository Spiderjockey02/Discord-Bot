// Dependecies
const { Client, Collection } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	GiveawaysManager = require('./giveaway/Manager'),
	Fortnite = require('fortnite'),
	{ KSoftClient } = require('@ksoft/api'),
	path = require('path');

// Creates Egglord class
module.exports = class Egglord extends Client {
	constructor(options) {
		super(options);
		// for console logging
		this.logger = require('../utils/Logger');

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
		if (this.config.api_keys.ksoft) {
			this.Ksoft = new KSoftClient(this.config.api_keys.ksoft);
		}

		// for Fortnite API
		if (this.config.api_keys.fortnite) {
			this.Fortnite = new Fortnite(this.config.api_keys.fortnite);
		}

		// Basic statistics for the bot
		this.messagesSent = 0;
		this.commandsUsed = 0;

		// for Screenshot command
		this.adultSiteList = [];

		// for webhook
		this.embedCollection = new Collection();

		// for emojis
		this.customEmojis = require('../assets/json/emojis.json');

		// for language translation
		this.languages = require('../languages/language-meta.json');

		// for waiting for things
		this.delay = ms => new Promise(res => setTimeout(res, ms));
	}

	// when the bot joins create guild settings
	async CreateGuild(settings) {
		try {
			const newGuild = new GuildSchema(settings);
			return await newGuild.save();
		} catch (err) {
			if (this.config.debug) this.logger.debug(err.message);
			return false;
		}
	}

	// Delete guild from server when bot leaves server
	async DeleteGuild(guild) {
		try {
			await GuildSchema.findOneAndRemove({ guildID: guild.id });
			return true;
		} catch (err) {
			if (this.config.debug) this.logger.debug(err.message);
			return false;
		}
	}

	// Set bot's activity
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
		if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
	}

	// Fetches adult sites for screenshot NSFW blocking
	async fetchAdultSiteList() {
		const blockedWebsites = require('../assets/json/whitelistWebsiteList.json');
		this.adultSiteList = blockedWebsites.websites;
		return this.adultSiteList;
	}

	// This will get the translation for the provided text
	translate(key, args, locale) {
		if (!locale) locale = this.config.defaultSettings.Language;
		const language = this.translations.get(locale);
		if (!language) throw 'Invalid language set in data.';
		return language(key, args);
	}

	// for adding embeds to the webhook manager
	addEmbed(channelID, embed) {
		// collect embeds
		if (!this.embedCollection.has(channelID)) {
			this.embedCollection.set(channelID, [embed]);
		} else {
			this.embedCollection.set(channelID, [...this.embedCollection.get(channelID), embed]);
		}
	}
};
