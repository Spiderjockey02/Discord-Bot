// Dependencies
const { Collection } = require('discord.js'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime }, functions: { genInviteLink } } = require('../../utils'),
	{ TagsSchema } = require('../../database/models'),
	AutoModeration = require('../../helpers/autoModeration'),
	LevelManager = require('../../helpers/levelSystem'),
	Event = require('../../structures/Event');

/**
 * Message create event
 * @event Egglord#MessageCreate
 * @extends {Event}
*/
class MessageCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Message} message The message that ran the command
	 * @readonly
	*/
	async run(bot, message) {
		// record how many messages the bot see
		bot.messagesSent++;

		// Should not respond to bots
		if (message.author.bot) return;

		// Get server settings
		const settings = message.guild?.settings ?? require('../../assets/json/defaultGuildSettings.json');
		if (Object.keys(settings).length == 0) return;

		// Check if bot was mentioned
		if (message.content == `<@!${bot.user.id}>`) {
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL({ format: 'png' }) })
				.setThumbnail(bot.user.displayAvatarURL({ format: 'png' }))
				.setDescription([
					message.translate('events/message:INTRO', { USER: bot.user.username }),
					message.translate('events/message:INFO', { UPTIME: getReadableTime(bot.uptime), GUILDS: bot.guilds.cache.size, USERS: bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString(), CMDS: bot.commands.size }),
					message.translate('events/message:PREFIX', { PREFIX: settings.prefix }),
				].join('\n\n'))
				.addField(message.translate('events/message:LINKS'), [
					message.translate('events/message:ADD', { INVITE: genInviteLink(bot) }),
					message.translate('events/message:SUPPORT', { LINK: bot.config.SupportServer.link }),
					message.translate('events/message:WEBSITE', { URL: bot.config.websiteURL }),
				].join('\n'));
			return message.channel.send({ embeds: [embed] });
		}

		// Check if the message was @someone
		if (['@someone', '@person'].includes(message.content)) {
			if (message.channel.type == 'dm') return message.channel.error('events/message:GUILD_ONLY');
			await message.guild.members.fetch();
			return message.channel.send({ embeds: [{ color: 'RANDOM', description:`Random user selected: ${message.guild.members.cache.random().user}.` }] });
		}

		// Check if message was a command
		const args = message.content.split(/ +/);
		if ([settings.prefix, `<@!${bot.user.id}>`].find(p => message.content.startsWith(p))) {
			const command = args.shift().slice(settings.prefix.length).toLowerCase();
			let cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
			if (!cmd && message.content.startsWith(`<@!${bot.user.id}>`)) {
				// check to see if user is using mention as prefix
				cmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
				args.shift();
				if (!cmd) return;
			} else if (!cmd) {
				const tag = message.guild.guildTags.find(result => result.toLowerCase() == command);
				if (tag) {
					const response = await TagsSchema.find({ guildID: message.guild.id, name: tag });
					return message.channel.send(response[0].response);
				} else {
					return;
				}
			}
			message.args = args;

			// make sure user is not on banned list
			if (message.author.cmdBanned) {
				if (message.deletable) message.delete();
				return message.channel.error('events/message:BANNED_USER').then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Make sure guild only commands are done in the guild only
			if (!message.guild && cmd.conf.guildOnly) {
				if (message.deletable) message.delete();
				return message.channel.error('events/message:GUILD_ONLY').then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Check to see if the command is being run in a blacklisted channel
			if ((settings.CommandChannelToggle) && (settings.CommandChannels.includes(message.channel.id))) {
				if (message.deletable) message.delete();
				return message.channel.error('events/message:BLACKLISTED_CHANNEL', { USER: message.author.tag }).then(m => m.timedDelete({ timeout:5000 }));
			}

			// Make sure NSFW commands are only being run in a NSFW channel
			if ((message.channel.type != 'dm') && ((!message.channel.nsfw) && (cmd.conf.nsfw))) {
				if (message.deletable) message.delete();
				return message.channel.error('events/message:NOT_NSFW_CHANNEL').then(m => m.timedDelete({ timeout:5000 }));
			}

			// Check if the command is from a disabled plugin
			if (!settings.plugins.includes(cmd.help.category) && cmd.help.category != 'Host') return;

			// Make sure user does not have access to ownerOnly commands
			if (cmd.conf.ownerOnly && !bot.config.ownerID.includes(message.author.id)) {
				if (message.deletable) message.delete();
				return message.channel.send('Nice try').then(m => m.timedDelete({ timeout:5000 }));
			}

			// check permissions
			if (message.guild) {
				// check bot permissions
				let neededPermissions = [];
				cmd.conf.botPermissions.forEach((perm) => {
					if (['SPEAK', 'CONNECT'].includes(perm)) {
						if (!message.member.voice.channel) return;
						if (!message.member.voice.channel.permissionsFor(message.guild.me).has(perm)) {
							neededPermissions.push(perm);
						}
					} else if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
						neededPermissions.push(perm);
					}

				});

				if (neededPermissions.length > 0) {
					bot.logger.error(`Missing permission: \`${neededPermissions.join(', ')}\` in [${message.guild.id}].`);
					if (message.deletable) message.delete();
					return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: neededPermissions.map((p) => message.translate(`permissions:${p}`)).join(', ') }).then(m => m.timedDelete({ timeout: 10000 }));
				}

				// check user permissions
				neededPermissions = [];
				cmd.conf.userPermissions.forEach((perm) => {
					if (!message.channel.permissionsFor(message.member).has(perm)) {
						neededPermissions.push(perm);
					}
				});

				if (neededPermissions.length > 0) {
					if (message.deletable) message.delete();
					return message.channel.error('misc:USER_PERMISSION', { PERMISSIONS: neededPermissions.map((p) => message.translate(`permissions:${p}`)).join(', ') }).then(m => m.timedDelete({ timeout: 10000 }));
				}
			}

			// Check to see if user is in 'cooldown'
			if (!bot.cooldowns.has(cmd.help.name)) {
				bot.cooldowns.set(cmd.help.name, new Collection());
			}

			const now = Date.now();
			const timestamps = bot.cooldowns.get(cmd.help.name);
			const cooldownAmount = (message.author.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					if (message.deletable) message.delete();
					return message.channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }).then(m => m.timedDelete({ timeout:5000 }));
				}
			}

			// run the command
			bot.commandsUsed++;
			if (bot.config.debug) bot.logger.debug(`Command: ${cmd.help.name} was ran by ${message.author.tag}${!message.guild ? ' in DM\'s' : ` in guild: ${message.guild.id}`}.`);
			cmd.run(bot, message, settings);
			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		} else if (message.guild) {
			if (settings.plugins.includes('Moderation')) {
				try {
					const moderated = await new AutoModeration(bot, message).check();
					// This makes sure that if the auto-mod punished member, level plugin would not give XP
					if (settings.plugins.includes('Level') && !moderated) return new LevelManager(bot, message).check();
				} catch (err) {
					console.log(err);
					bot.logger.error(`Event: 'message' has error: ${err.message}.`);
				}
			} else if (settings.plugins.includes('Level')) {
				new LevelManager(bot, message).check();
			}
		}
	}
}

module.exports = MessageCreate;
