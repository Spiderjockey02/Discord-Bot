// Dependecies
const { Client, Collection } = require('discord.js');
const { Guild } = require('../modules/database/models');
const mongoose = require('mongoose');
const GiveawaysManager = require('./giveaway/Manager');
const Fortnite = require('fortnite');
const { KSoftClient } = require('@ksoft/api');

// Creates Egglord class
module.exports = class Egglord extends Client {
	constructor(options) {
		super(options);
		// for console logging
		this.logger = require('../modules/logging');

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

		// connect to database
		this.mongoose = require('../modules/database/mongoose');

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
	}

	// when the this joins add guild settings to server
	async CreateGuild(settings) {
		const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, settings);
		const newGuild = await new Guild(merged);
		return newGuild.save();
	}

	// Delete guild from server when this leaves server
	async DeleteGuild(guild) {
		await Guild.findOneAndRemove({ guildID: guild.id }, (err) => {
			if (err) console.log(err);
		});
		return;
	}

	// Fetch user ID from discord API
	async getUser(ID) {
		try {
			const user = (this.users.cache.get(ID)) ? this.users.cache.get(ID) : await this.users.fetch(ID);
			return user;
		} catch (e) {
			console.log(e);
		}
	}

	async getChannel(id) {
		const channel = await this.channels.cache.get(id);
		return channel;
	}
	// Set this's status
	async SetStatus(status = 'online') {
		try {
			await this.user.setStatus(status);
			return;
		} catch (e) {
			console.log(e);
			return e;
		}
	}

	// Set this's activity
	SetActivity(array = [], type = 'PLAYING') {
		this.Activity = array;
		this.PresenceType = type;
		try {
			let j = 0;
			setInterval(() => this.user.setActivity(`${this.Activity[j++ % this.Activity.length]}`, { type: type }), 10000);
			return;
		} catch (e) {
			console.log(e);
		}
	}
};
