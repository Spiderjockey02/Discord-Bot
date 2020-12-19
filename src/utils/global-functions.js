// guild settings
const { Guild } = require('../modules/database/models');
const mongoose = require('mongoose');

module.exports = bot => {

	// Get guild settings
	bot.getGuild = async (guild) => {
		const data = await Guild.findOne({ guildID: guild.id });
		return data;
	};

	// update guild settings
	bot.updateGuild = async (guild, settings) => {
		let data = await bot.getGuild(guild);
		if (typeof data !== 'object') data = {};
		for (const key in settings) {
			if (settings.key) {
				if (data[key] !== settings[key]) data[key] = settings[key];
				else return;
			}
		}
		bot.logger.log(`Guild: [${data.guildID}] updated settings: ${Object.keys(settings)}`);
		return await data.updateOne(settings);
	};

	// when the bot joins add guild settings to server
	bot.CreateGuild = async (settings) => {
		const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, settings);
		const newGuild = await new Guild(merged);
		return newGuild.save();
	};
	// Delete guild from server when bot leaves server
	bot.DeleteGuild = async (guild) => {
		const data = await Guild.findOne({ guildID: guild.id });
		Guild.deleteOne(data, function(err) {
			if (err) throw err;
		});
		return;
	};

	// Get User from @ or ID
	bot.getUsers = (message, args) => {
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
	};

	// Get image, from file download or avatar
	bot.GetImage = (message, args, Language) => {
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
				file.push(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
			}
			// Checks if a link to image was entered
			if (args[1] && !(args[1].startsWith('<') && args[1].endsWith('>'))) {
				file.push(args[1]);
			}
			// add user
			file.push(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
			// send file;
		}
		return file;
	};
};
