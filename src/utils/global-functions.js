// guild settings
const { Guild } = require('../modules/database/models');
const mongoose = require('mongoose');

module.exports = bot => {

	// Get guild settings
	bot.getGuild = async (guild) => {
		const data = await Guild.findOne({ guildID: guild.id });
		if (data) return data;
		else return bot.config.defaultSettings;
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

	// This handlers music permissin/check to see if user is in voice channel
	bot.musicHandler = (message, args, emojis, settings) => {
		// Check if bot can see user in channel (the user is in a channel)
		if (!message.member.voice.channelID) {
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are not connected to a voice channel.` } }).then(m => m.delete({ timeout: 10000 }));
			message.delete();
			return false;
		}
		// Check if bot can join channel
		if (!message.guild.me.hasPermission('CONNECT')) {
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`CONNECT\`.` } }).then(m => m.delete({ timeout: 10000 }));
			bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}].`);
			return false;
		}
		// Check if bot can speak in channel
		if (!message.guild.me.hasPermission('SPEAK')) {
			if (message.deletable) message.delete();
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`SPEAK\`.` } }).then(m => m.delete({ timeout: 10000 }));
			bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}].`);
			return false;
		}
		// Check if an 'entry' was added
		if (args.length == 0) {
			if (message.content.includes('playlist')) {
				message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('add-playlist').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
			} else {
				message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('play').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
			}
			return false;
		}
		return true;
	};

	// Get User from @ or ID
	bot.GetUser = (message, args) => {
		let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		// if user isn't mentioned then use avatar
		if (!user) user = message.guild.member(message.author);
		return user;
	};

	// Get image, from file download or avatar
	bot.GetImage = (message, emojis) => {
		const fileTypes = ['png', 'jpeg', 'tiff', 'jpg'];
		// Get user
		const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
		// get image if there is one
		const file = [];
		if (message.attachments.size > 0) {
			const url = message.attachments.first().url;
			for (let i = 0; i < fileTypes.length; i++) {
				if (url.indexOf(fileTypes[i]) !== -1) {
					file.push(url);
				}
			}
			// no file with the correct format was found
			if (!file) message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} That file format is not currently supported.` } }).then(m => m.delete({ timeout: 10000 }));
		}
		// check user
		if (user != message.author) {
			file.push(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
		}
		// add user
		file.push(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));
		// send file;
		return file;
	};
};
