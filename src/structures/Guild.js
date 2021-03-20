// Dependencies
const { Structures } = require('discord.js'),
	{ Guild: guild } = require('../modules/database/models'),
	logger = require('../utils/logger'),
	sm = require('string-similarity');

module.exports = Structures.extend('Guild', Guild => {
	class CustomGuild extends Guild {
		constructor(bot, data) {
			super(bot, data);
			// This for caching server settings
			this.settings = {};

			// for voice recording
			this.voiceRecording = false;
		}

		// Fetch guild settings (only on ready event)
		async fetchGuildConfig() {
			const data = await guild.findOne({ guildID: this.id });
			this.settings = data;
		}

		// update guild settings
		async updateGuild(settings) {
			let data = this.settings;
			if (typeof data !== 'object') data = {};
			for (const key in settings) {
				if (settings.key) {
					if (data[key] !== settings[key]) data[key] = settings[key];
					else return;
				}
			}
			logger.log(`Guild: [${data.guildID}] updated settings: ${Object.keys(settings)}`);
			return await data.updateOne(settings).then(async () => await this.fetchGuildConfig());
		}

		// Get User from @ or ID
		getMember(message, args) {
			const users = [];
			// add all mentioned users
			for (let i = 0; i < args.length; i++) {
				if (this.member(message.mentions.users.array()[i] || this.members.cache.get(args[i]))) {
					users.push(this.member(message.mentions.users.array()[i] || this.members.cache.get(args[i])));
				}
			}
			// find user
			if (args[0]) {
				const members = [];
				const indexes = [];
				message.guild.members.cache.forEach(member => {
					members.push(member.user.username);
					indexes.push(member.id);
				});
				const match = sm.findBestMatch(args.join(' '), members);
				const username = match.bestMatch.target;
				const member = message.guild.members.cache.get(indexes[members.indexOf(username)]);
				users.push(member);
			}

			// add author at the end
			users.push(message.member);
			return users;
		}

		// Get image, from file download or avatar
		GetImage(message, args, Language) {
			const fileTypes = ['png', 'jpeg', 'tiff', 'jpg', 'webp'];
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
				file.push(...this.getMember(message, args).map(member => member.user.displayAvatarURL({ format: 'png', size: 1024 })));
			}
			return file;
		}
	}
	return CustomGuild;
});
