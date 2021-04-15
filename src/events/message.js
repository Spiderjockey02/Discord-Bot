// Dependencies
const { GlobalBanSchema } = require('../database/models'),
	{ MessageEmbed, Collection } = require('discord.js'),
	moment = require('moment'),
	Event = require('../structures/Event');

module.exports = class Message extends Event {
	async run(bot, message) {
		// record how many messages the bot see
		bot.messagesSent++;

		// Should not respond to bots
		if (message.author.bot) return;

		// Get server settings
		const settings = (message.guild) ? message.guild.settings : bot.config.defaultSettings;
		if (Object.keys(settings).length == 0) return;

		// Check if bot was mentioned
		if (message.content == `<@!${bot.user.id}>`) {
			const embed = new MessageEmbed()
				.setAuthor(bot.user.username, bot.user.displayAvatarURL({ format: 'png' }))
				.setThumbnail(bot.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					`Hello, my name is ${bot.user.username}, and I'm a multi-purpose Discord bot, built to help you with all of your server problems and needs.`,
					`I've been online for ${moment.duration(bot.uptime).format('d[d] h[h] m[m] s[s]')}, helping ${bot.guilds.cache.size} servers and ${bot.users.cache.size} users with ${bot.commands.size} commands.`,
				].join('\n\n'))
				.addField('Useful Links:', [
					`[Add to server](https://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot)`,
					`[Join support server](${bot.config.SupportServer.link})`,
					`[Website](${bot.config.websiteURL})`,
				].join('\n'));
			return message.channel.send(embed).catch(err => bot.logger.error(`Event: 'message' has error: ${err.message}.`));
		}

		// Check if the message was @someone
		if (['@someone', '@person'].includes(message.content)) {
			if (message.channel.type == 'dm') return message.channel.error(settings.Language, 'EVENTS/GUILD_COMMAND_ERROR');
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
			message.args = args;

			// make sure user is not on banned list
			const banned = await GlobalBanSchema.findOne({
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
			if (message.guild && cmd.guildOnly)	return message.channel.error(settings.Language, 'EVENTS/GUILD_COMMAND_ERROR').then(m => m.delete({ timeout: 5000 }));

			// Check to see if the command is being run in a blacklisted channel
			if ((settings.CommandChannelToggle) && (settings.CommandChannels.includes(message.channel.id))) {
				if (message.deletable) message.delete();
				return message.channel.error(settings.Language, 'EVENTS/BLACKLISTED_CHANNEL', message.author.tag).then(m => m.delete({ timeout:5000 }));
			}

			// Make sure NSFW commands are only being run in a NSFW channel
			if ((message.channel.type != 'dm') && ((!message.channel.nsfw) && (cmd.conf.nsfw))) {
				if (message.deletable) message.delete();
				return message.channel.error(settings.Language, 'EVENTS/NOT_NSFW_CHANNEL').then(m => m.delete({ timeout:5000 }));
			}

			// Check if the command is from a disabled plugin
			if (!settings.plugins.includes(cmd.help.category) && cmd.help.category != 'Host') return;

			// Make sure user does not have access to ownerOnly commands
			if (cmd.conf.ownerOnly && !bot.config.ownerID.includes(message.author.id)) return message.channel.send('Nice try').then(m => m.delete({ timeout:5000 }));

			// Check if command is disabled
			if ((message.channel.type != 'dm') && (settings.DisabledCommands.includes(cmd.name))) return;

			// Check to see if user is in 'cooldown'
			if (!bot.cooldowns.has(cmd.help.name)) {
				bot.cooldowns.set(cmd.help.name, new Collection());
			}

			const now = Date.now();
			const timestamps = bot.cooldowns.get(cmd.help.name);
			const cooldownAmount = (cmd.conf.cooldown || 3000);

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					return message.channel.error(settings.Language, 'EVENTS/COMMAND_COOLDOWN', timeLeft.toFixed(1)).then(m => m.delete({ timeout:5000 }));
				}
			}

			// run the command
			bot.commandsUsed++;
			if (bot.config.debug) bot.logger.debug(`Command: ${cmd.help.name} was ran by ${message.author.tag}${!message.guild ? '' : ` in guild: ${message.guild.id}`}.`);
			cmd.run(bot, message, settings);
			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		} else if (message.guild) {
			if (settings.plugins.includes('Moderation')) {
				try {
					const check = require('../helpers/auto-moderation').run(bot, message, settings);
					// This makes sure that if the auto-mod punished member, level plugin would not give XP
					if (settings.plugins.includes('Level') && check) return require('../helpers/level-system').run(bot, message, settings);
				} catch (err) {
					bot.logger.error(`Event: 'message' has error: ${err.message}.`);
				}
			} else if (settings.plugins.includes('Level')) {
				require('../helpers/level-system').run(bot, message, settings);
			}
		}
	}
};
