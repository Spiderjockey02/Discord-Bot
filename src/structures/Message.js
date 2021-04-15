const { Structures } = require('discord.js'),
	sm = require('string-similarity');

module.exports = Structures.extend('Message', Message => {
	class CustomMessage extends Message {
		// Get User from @ or ID
		getMember(args) {
			const users = [];
			// add all mentioned users
			for (let i = 0; i < args.length; i++) {
				if (this.member(this.mentions.users.array()[i] || this.members.cache.get(args[i]))) {
					users.push(this.member(this.mentions.users.array()[i] || this.members.cache.get(args[i])));
				}
			}
			// find user
			if (args[0]) {
				const members = [];
				const indexes = [];
				this.guild.members.cache.forEach(member => {
					members.push(member.user.username);
					indexes.push(member.id);
				});
				const match = sm.findBestMatch(args.join(' '), members);
				const username = match.bestMatch.target;
				const member = this.guild.members.cache.get(indexes[members.indexOf(username)]);
				users.push(member);
			}

			// add author at the end
			users.push(this.member);
			return users;
		}

		// Get image, from file download or avatar
		GetImage(args, Language) {
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
				if (file.length == 0) return this.channel.error(Language, 'IMAGE/INVALID_FILE').then(m => m.delete({ timeout: 10000 }));
			} else {
				file.push(...this.getMember(this, args).map(member => member.user.displayAvatarURL({ format: 'png', size: 1024 })));
			}
			return file;
		}
	}
	return CustomMessage;
});
