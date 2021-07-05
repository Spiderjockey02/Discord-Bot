// Dependencies
const { Message } = require('discord.js'),
	{ findBestMatch } = require('string-similarity');

module.exports = Object.defineProperties(Message.prototype, {
	args: {
		value: [],
		writable: true,
	},
	// Fetch the args from a message
	getArgs: {
		value: function() {
			const args = this.content.split(' ');
			args.shift();
			if (this.content.startsWith(`<@!${this.client.user.id}>`)) args.shift();

			// append it to message structure
			this.args = args;
			return args;
		},
	},
	// Get member(s) from message (via ID, mention or username)
	getMember: {
		value: async function() {
			const users = [];
			// add all mentioned users
			for (let i = 0; i < this.args.length; i++) {
				// eslint-disable-next-line no-empty-function
				if (this.mentions.members.array()[i] || await this.guild.members.fetch(this.args[i]).catch(() => {})) {
					// eslint-disable-next-line no-empty-function
					users.push(this.mentions.members.array()[i] || await this.guild.members.fetch(this.args[i]).catch(() => {}));
				}
			}
			// find user
			if (this.args[0]) {
				// fetch all members before search
				await this.guild.members.fetch();

				// search for members
				const members = [], indexes = [];
				this.guild.members.cache.forEach(member => {
					members.push(member.user.username);
					indexes.push(member.id);
				});
				const match = findBestMatch(this.args.join(' '), members);
				if (match.bestMatch.rating >= 0.1) {
					const username = match.bestMatch.target,
						member = this.guild.members.cache.get(indexes[members.indexOf(username)]);
					users.push(member);
				}
			}
			// add author at the end
			users.push(this.member);
			return users;
		},
	},
	// Get channel(s) from message (via ID or mention)
	getChannel: {
		value: async function() {
			const channels = [];
			// get all channels mentioned
			for (let i = 0; i < this.args.length; i++) {
				if (this.mentions.channels.array()[i] || this.guild.channels.cache.get(this.args[i])) {
					channels.push(this.mentions.channels.array()[i] || this.guild.channels.cache.get(this.args[i]));
				}
			}
			channels.push(this.channel);
			return channels;
		},
	},
	// Get role(s) from message (via ID, mention or name)
	getRole: {
		value: function() {
			const roles = [];
			// get all channels mentioned
			for (let i = 0; i < this.args.length; i++) {
				if (this.mentions.roles.array()[i] || this.guild.roles.cache.get(this.args[i])) {
					roles.push(this.mentions.roles.array()[i] || this.guild.roles.cache.get(this.args[i]));
				}
			}
			if (this.args[0]) {
				const roleList = [];
				this.guild.roles.cache.forEach(r => {
					roleList.push(r.name);
				});
				const match = findBestMatch(this.args.join(' '), roleList);
				if (match.bestMatch.rating != 0) {
					const username = match.bestMatch.target,
						role = this.guild.roles.cache.find(r => r.name == username);
					roles.push(role);
				}
			}
			// return the array of roles
			return roles;
		},
	},
	// Get image(s) from message (via file upload, message link, reply feature or this.getMember()'s avatar)
	getImage: {
		value: async function() {
			const fileTypes = ['png', 'jpeg', 'tiff', 'jpg', 'webp'];
			// get image if there is one
			const file = [];
			// Check attachments
			if (this.attachments.size > 0) {
				const url = this.attachments.first().url;
				for (let i = 0; i < fileTypes.length; i++) {
					if (url.toLowerCase().indexOf(fileTypes[i]) !== -1) {
						file.push(url);
					}
				}

				// no file with the correct format was found
				if (file.length == 0) return this.channel.error(this.guild.settings.Language, 'IMAGE/INVALID_FILE').then(m => m.timedDelete({ timeout: 10000 }));
			}

			// check for message link
			for (const value of this.args) {
				const patt = /https?:\/\/(?:(?:canary|ptb|www)\.)?discord(?:app)?\.com\/channels\/(?:@me|(?<g>\d+))\/(?<c>\d+)\/(?<m>\d+)/g;
				if (!patt.test(value)) return;
				const stuff = value.split('/');
				const message = await this.client.guilds.cache.get(stuff[4])?.channels.cache.get(stuff[5])?.messages.fetch(stuff[6]);
				if (!message && message.attachments.size == 0) return;
				const url = message.attachments.first().url;
				for (const type of fileTypes) {
					if (url.indexOf(type) !== -1) file.push(url);
				}
			}

			// Check message reply
			if (this.type == 'REPLY') {
				const messages = await this.channel.messages.fetch(this.reference.messageID);
				const url = messages.attachments.first().url;
				for (const type of fileTypes) {
					if (url.indexOf(type) !== -1) file.push(url);
				}
			}
			// add avatar URL's to file
			file.push(...(await this.getMember()).map(member => member.user.displayAvatarURL({ format: 'png', size: 1024 })));
			return file;
		},
	},
	// Check if bot has permission to send custom emoji
	checkEmoji: {
		value: function() {
			if (this.channel.type == 'dm') {
				return true;
			} else {
				return this.channel.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? true : false;
			}
		},
	},
	// Used for translating strings
	translate: {
		value: function(key, args) {
			const language = this.client.translations.get(this.guild?.settings.Language ?? 'en-US');
			if (!language) return 'Invalid language set in data.';
			return language(key, args);
		},
	},
	// Added timed message delete as djs v13 removed it.
	timedDelete: {
		value: function(obj) {
			setTimeout(() => {
				this.delete();
			}, obj.timeout || 3000);
		},
	},
});
