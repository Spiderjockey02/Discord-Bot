// Dependecies
const { Client, Collection } = require('discord.js');
const { Guild } = require('../modules/database/models');
const mongoose = require('mongoose');
const GiveawaysManager = require('./giveaway/Manager');

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

		// connect to database and get global functions
		this.mongoose = require('../modules/database/mongoose');

		// config file
		this.config = require('../config.js');

		// for voice recording
		this.recordings = [];
	}

	// Get guild's setting
	async getGuild(guild) {
		const data = await Guild.findOne({ guildID: guild.id });
		return data;
	}

	// update guild settings
	async updateGuild(guild, settings) {
		let data = await this.getGuild(guild);
		if (typeof data !== 'object') data = {};
		for (const key in settings) {
			if (settings.key) {
				if (data[key] !== settings[key]) data[key] = settings[key];
				else return;
			}
		}
		this.logger.log(`Guild: [${data.guildID}] updated settings: ${Object.keys(settings)}`);
		return await data.updateOne(settings);
	}

	// when the bot joins add guild settings to server
	async CreateGuild(settings) {
		const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, settings);
		const newGuild = await new Guild(merged);
		return newGuild.save();
	}
	// Delete guild from server when bot leaves server
	async DeleteGuild(guild) {
		await Guild.findOneAndRemove({ guildID: guild.id }, (err) => {
			if (err) console.log(err);
		});
		return;
	}

	// Get User from @ or ID
	getUsers(message, args) {
		const users = [];
		// add all mentioned users
		for (let i = 0; i < args.length; i++) {
			if (message.guild.member(message.mentions.users.array()[i] || message.guild.members.cache.get(args[i]))) {
				users.push(message.guild.member(message.mentions.users.array()[i] || message.guild.members.cache.get(args[i])));
			}
		}
		// add author at the end
		users.push(message.member);
		return users;
	}

	// Get image, from file download or avatar
	GetImage(message, args, Language) {
		const fileTypes = ['png', 'jpeg', 'tiff', 'jpg', 'webp'];
		// Get user
		const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
		// get image if there is one
		const file = [];
		// Check attachments
		if (message.attachments.size > 0) {
			const url = message.attachments.first().url;
			for (let i = 0; i < fileTypes.length; i++) {
				if (url.indexOf(fileTypes[i]) !== -1) {
					file.push(url);
				}
			}
			// no file with the correct format was found
			if (file.length == 0) return message.error(Language, 'IMAGE/INVALID_FILE').then(m => m.delete({ timeout: 10000 }));
		} else {
			// check user
			if (user != message.author) {
				file.push(user.displayAvatarURL({ format: 'png', size: 1024 }));
			}
			// Checks if a link to image was entered
			if (args[1] && !(args[1].startsWith('<') && args[1].endsWith('>'))) {
				file.push(args[1]);
			}
			// add user
			file.push(message.author.displayAvatarURL({ format: 'png', size: 1024 }));
			// send file;
		}
		return file;
	}
};
