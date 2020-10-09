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
			if (settings.hasOwnProperty(key)) {
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
	bot.PermissionHandler = (message, userPermissions, botPermissions, emojis, settings) => {
		// userPermissions & botPermissions will be arrays
		console.log('This is to replace all permission checks on commands and make a single permission handler');
	};
};
