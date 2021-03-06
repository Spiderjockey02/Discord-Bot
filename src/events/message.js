// Dependencies
const { Globalban } = require('../modules/database/models'),
	{ MessageEmbed, Collection } = require('discord.js'),
	moment = require('moment');

// List of users in command cooldown
const cooldowns = new Collection();

module.exports = async (bot, message) => {
	// record how many messages the bot see
	bot.messagesSent++;

	// Should not respond to bots
	if (message.author.bot) return;

	// Get server settings
	const settings = (message.guild) ? message.guild.settings : bot.config.defaultSettings;

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
	if ([settings.prefix, `<@!${bot.user.id}>`].find(p => message.content.startsWith(p))) {
		const command = args.shift().slice(settings.prefix.length).toLowerCase();
		let cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (!cmd && message.content.startsWith(`<@!${bot.user.id}>`)) {
			// check to see if user is using mention as prefix
			cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
			args.shift();
			if (!cmd) return;
		} else if (!cmd) {
			return;
		}

		// make sure user is not on banned list
		const banned = await Globalban.findOne({
			userID: message.author.id,
		}, async (err, res) => {
			if (err) bot.logger.error(err.message);

			// This is their first warning
			if (res) {
				return true;
			} else {
				return false;
			}
		});
		if (banned) return message.channel.send('You are banned from using command');


		// Make sure guild only commands are done in the guild only
		if (message.guild && cmd.guildOnly)	return message.error(settings.Language, 'EVENTS/GUILD_COMMAND_ERROR').then(m => m.delete({ timeout: 5000 }));

		// Check to see if the command is being run in a blacklisted channel
		if ((settings.CommandChannelToggle) && (settings.CommandChannels.includes(message.channel.id))) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'EVENTS/BLACKLISTED_CHANNEL', message.author.tag).then(m => m.delete({ timeout:5000 }));
		}

		// Make sure NSFW commands are only being run in a NSFW channel
		if ((message.channel.type != 'dm') && ((!message.channel.nsfw) && (cmd.conf.nsfw))) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'EVENTS/NOT_NSFW_CHANNEL').then(m => m.delete({ timeout:5000 }));
		}

		// Check if the command is from a disabled plugin
		if (cmd.help.category == 'Music' && !settings.MusicPlugin) return;
		if (cmd.help.category == 'Moderation' && !settings.ModerationPlugin) return;
		if (cmd.help.category == 'Level' && !settings.LevelPlugin) return;
		if (cmd.help.category == 'Trivia' && !settings.MusicTriviaPlugin) return;
		if (cmd.help.category == 'Searcher' && !settings.SearchPlugin) return;
		if (cmd.help.category == 'NSFW' && !settings.NSFWPlugin) return;
		if ((message.channel.type != 'dm') && (settings.DisabledCommands.includes(cmd.name))) return;

		// make sure user doesn't access HOST commands
		if (!bot.config.ownerID.includes(message.author.id) && cmd.conf.ownerID) return;

		// Check bot has permissions
		if (cmd.conf.botPermissions[0]) {
			// If the bot doesn't have SEND_MESSAGES permissions just return
			if (!message.channel.permissionsFor(bot.user).has('SEND_MESSAGES')) return;
			if (!message.channel.permissionsFor(bot.user).has('EMBED_LINKS')) {
				return message.sendT(settings.Language, 'MISSING_PERMISSION', 'EMBED_LINKS');
			}
		}

		// Check to see if user is in 'cooldown'
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3000);

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.error(settings.Language, 'EVENTS/COMMAND_COOLDOWN', timeLeft.toFixed(1)).then(m => m.delete({ timeout:5000 }));
			}
		}

		// run the command
		bot.commandsUsed++;
		cmd.run(bot, message, args, settings);
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
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
