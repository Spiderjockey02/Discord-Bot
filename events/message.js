// Get prefix for bot
const Discord = require('discord.js');
// Map for music
const active = new Map();

// cooldown on commands (2.5 seconds)
const commandcd = new Set();

function duration(ms) {
	const sec = Math.floor((ms / 1000) % 60).toString();
	const min = Math.floor((ms / (1000 * 60)) % 60).toString();
	const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString();
	const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString();
	return `${days.padStart(1, '0')}:${hrs.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`;
}
// This gets message from discord server and checks for (command, moderation)
module.exports = async (bot, message) => {
	// Make sure the bot isnt speaking to its self
	if (message.author.bot == true) return;

	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(message.guild);
	}
	catch (e) {
		settings = bot.config.defaultSettings;
	}

	// If bot is mentioned show help (User probably dosen't know how to interact to me)
	if (message.mentions.has(bot.user) && message.content == '<@!647203942903840779>') {
		// make sure egglord has SEND_MESSAGES permission
		if (message.channel.type != 'dm') {
			const permissions = message.channel.permissionsFor(bot.user);
			if (!permissions.has('SEND_MESSAGES')) return bot.logger.error(`Missing permission: \`SEND_MESSAGES\` in [${message.guild.id}]`);
		}
		// Send egglord information to user
		const embed = new Discord.MessageEmbed()
			.setTitle('Egglord Information')
			.setURL(bot.config.Dashboard.domain)
			.setThumbnail('https://i.imgur.com/2otMem9.png')
			.setDescription(`I help moderate [${bot.guilds.cache.size}] servers\n Your server prefix: ${settings.prefix}help\n Got a bug? Report it here ${settings.prefix}bug\n[Add to server](https://discordapp.com/api/oauth2/authorize?client_id=647203942903840779&permissions=8&scope=bot)`)
			.addField('Server Count:', `${bot.guilds.cache.size} (${bot.users.cache.size} users)`)
			.addField('Uptime:', `${duration(bot.uptime)}`)
			.addField('Total Commands:', `${bot.commands.size} (!help)`)
			.addField('Ping:', `${Math.round(bot.ws.ping)}ms`)
			.setTimestamp()
			.setFooter(`Requested by @${message.author.username}`);
		message.channel.send(embed);
	}

	// Checks to see if a command was initated
	const args = message.content.split(' ');
	const command = args.shift().slice(settings.prefix.length).toLowerCase();
	const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
	const ops = {
		active: active,
	};
	// Check for commands (+ command cooldown -2.5 seconds)
	if (cmd && message.content.startsWith(settings.prefix)) {
		// Check for SEND_MESSAGES permission
		// only run Fun, Host & Search plugin commands in DM's
		if (message.channel.type == 'dm') {
			// Make sure command is not a server only command.
			if (cmd.help.category == 'Guild' || cmd.help.category == 'Levels' || cmd.help.category == 'Music' || cmd.help.category == 'Trivia') {
				message.channel.send({ embed:{ color:15158332, description:'<:Cross:746456031332270191> That command can only be ran in a server.' } }).then(m => m.delete({ timeout: 10000 }));
				return;
			}
		}
		else {
			// Check for server permissions
			const permissions = message.channel.permissionsFor(bot.user);
			// Check for SEND_MESSAGES permission
			if (!permissions.has('SEND_MESSAGES')) {
				bot.logger.error(`Missing permission: \`SEND_MESSAGES\` in [${message.guild.id}]`);
				return;
			}
			// Check for USE_EXTERNAL_EMOJIS permission
			if (!permissions.has('USE_EXTERNAL_EMOJIS')) {
				message.channel.send(':negative_squared_cross_mark: I am missing the permission: `USE_EXTERNAL_EMOJIS`.').then(m => m.delete({ timeout: 10000 }));
				bot.logger.log(`Mising permission: \`USE_EXTERNAL_EMOJIS\` in [${message.guild.id}]`);
				return;
			}
			// Check for EMBED_LINKS permission
			if (!permissions.has('EMBED_LINKS')) {
				message.channel.send('<:Cross:746456031332270191> I am missing the permission: `EMBED_LINKS`.').then(m => m.delete({ timeout: 10000 }));
				bot.logger.error(`Missing permission: \`EMBED_LINKS\` in [${message.guild.id}]`);
				return;
			}
		}
		// Check if user is in command cooldown check
		if (commandcd.has(message.author.id) && (message.author.id != bot.config.ownerID)) {
			message.delete();
			message.channel.send({ embed:{ description:`You must wait ${settings.CommandCooldownSec} seconds between each command.` } }).then(m => m.delete({ timeout: 5000 }));
			return;
		}
		// Check to see if the command is being ran from a channel thats blacklisted
		if ((settings.OnlyCommandChannel == true) && (settings.CommandChannel !== message.channel.name)) {
			// Tell user that they cant use commnads in this channel
			message.channel.send({ embed:{ color:15158332, description:`<:Cross:746456031332270191> **${message.author.username}#${message.author.discriminator}**, that command is disabled in this channel.` } }).then(m => m.delete({ timeout: 10000 }));
		}
		else {
			cmd.run(bot, message, args, settings, ops);
		}
		if (settings.CommandCooldown == true) {
			commandcd.add(message.author.id);
			setTimeout(() => {
				commandcd.delete(message.author.id);
			}, settings.CommandCooldownSec * 1000);
		}
		return;
	}
	// moderation plugin
	if (settings.ModerationPlugin == true) {
		require('../modules/moderation').run(bot, message, settings);
	}

	// Rank plugin
	if (settings.LevelPlugin == true) {
		require('../modules/Levels').run(bot, message, settings);
	}
};
