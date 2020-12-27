// Dependencies
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
// List of users in command cooldown
const commandcd = new Set();

module.exports = async (bot, message) => {
	// Should not respond to bots
	if (message.author.bot) return;

	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(message.guild);
	} catch (err) {
		settings = bot.config.defaultSettings;
	}
	if (!settings && message.channel.type != 'dm') {
		await bot.emit('guildCreate', message.guild);
		try {
			settings = await bot.getGuild(message.guild);
		} catch (err) {
			bot.logger.error(err.message);
		}
	}

	// Check if bot was mentioned
	if (message.content == `<@!${bot.user.id}>`) {
		const embed = new MessageEmbed()
			.setTitle(`${bot.user.username}'s Information`)
			.setURL(bot.config.websiteURL)
			.setThumbnail(bot.user.displayAvatarURL())
			.setDescription(`I help moderate [${bot.guilds.cache.size}] servers\n Your server prefix: ${settings.prefix}help\n Got a bug? Report it here ${settings.prefix}bug\n[Add to server](https://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot)`)
			.addField('Server Count:', `${bot.guilds.cache.size} (${bot.users.cache.size} users)`)
			.addField('Uptime:', moment.duration(bot.uptime).format('D [days], H [hrs], m [mins], s [secs]'))
			.addField('Total Commands:', `${bot.commands.size} (!help)`)
			.addField('Ping:', `${Math.round(bot.ws.ping)}ms`)
			.setTimestamp()
			.setFooter(`Requested by @${message.author.username}`);
		return message.channel.send(embed);
	}

	// Check if the message was @someone
	if (['@someone', '@person'].includes(message.content)) {
		if (message.channel.type == 'dm') return message.error(settings.Language, 'EVENTS/GUILD_COMMAND_ERROR');
		return message.channel.send({ embed:{ color: 'RANDOM', description:`Random user selected: ${message.guild.members.cache.random().user}.` } });
	}

	// Check if message was a command
	const args = message.content.split(' ');
	const command = args.shift().slice(settings.prefix.length).toLowerCase();
	const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
	if (cmd && message.content.startsWith(settings.prefix)) {
		// Make sure guild only commands are done in the guild only
		if (message.channel.type == 'dm') {
			if (['Giveaway', 'Guild', 'Level', 'Misc', 'Music', 'Moderation', 'Trivia'].includes(cmd.help.category)) {
				return message.error(settings.Language, 'EVENTS/GUILD_COMMAND_ERROR').then(m => m.delete({ timeout: 5000 }));
			}
		}
		// Check to see if user is in 'cooldown'
		if (commandcd.has(message.author.id)) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'EVENTS/COMMAND_COOLDOWN', settings.CommandCooldownSec).then(m => m.delete({ timeout:5000 }));
		}

		// Check to see if the command is being run in a blacklisted channel
		if ((settings.CommandChannelToggle) && (settings.CommandChannels.includes(message.channel.id))) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'EVENTS/BLACKLISTED_CHANNEL', message.author.tag).then(m => m.delete({ timeout:5000 }));
		}

		// Make sure NSFW commands are only being run in a NSFW channel
		if ((message.channel.type != 'dm') && ((!message.channel.nsfw) && (cmd.help.category == 'Nsfw' || ['urban', 'advice'].includes(cmd.config.command)))) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'EVENTS/NOT_NSFW_CHANNEL').then(m => m.delete({ timeout:5000 }));
		}

		// Check if the command is from a disabled plugin
		if (cmd.help.category == 'Music' && !settings.MusicPlugin) return;
		if (cmd.help.category == 'Moderation' && !settings.ModerationPlugin) return;
		if (cmd.help.category == 'Level' && !settings.LevelPlugin) return;
		if (cmd.help.category == 'Trivia' && !settings.MusicTriviaPlugin) return;
		if (cmd.help.category == 'Search' && !settings.SearchPlugin) return;
		if (cmd.help.category == 'Nsfw' && !settings.NSFWPlugin) return;
		if ((message.channel.type != 'dm') && (settings.DisabledCommands.includes(cmd.config.command))) return;

		// run command
		cmd.run(bot, message, args, settings);
		if (settings.CommandCooldown) {
			commandcd.add(message.author.id);
			setTimeout(() => {
				commandcd.delete(message.author.id);
			}, settings.CommandCooldownSec * 1000);
		}
	} else if (settings.ModerationPlugin) {
		try {
			const check = require('../helpers/auto-moderation').run(bot, message, settings);
			// This makes sure that if the auto-mod punished member, level plugin would not give XP
			if (settings.LevelPlugin == true && check) return require('../helpers/level-system').run(bot, message, settings);
		} catch (e) {
			console.log(e);
		}
	} else if (settings.LevelPlugin) {
		require('../helpers/level-system').run(bot, message, settings);
	}
};
