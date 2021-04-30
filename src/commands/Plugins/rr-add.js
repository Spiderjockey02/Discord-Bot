// Dependecies
const Command = require('../../structures/Command.js'),
	{ ReactionRoleSchema } = require('../../database/models'),
	{ MessageEmbed } = require('discord.js');

module.exports = class ReactionRoleAdd extends Command {
	constructor(bot) {
		super(bot, {
			name: 'reactionroles-add',
			dirname: __dirname,
			aliases: ['rr-add'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES'],
			description: 'Create a reaction role',
			usage: 'rr-add [channelID]',
			cooldown: 5000,
			examples: ['rr-add 37844848481818441'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// check if the guild has reached max reaction roles
		await ReactionRoleSchema.find({
			guildID: message.guild.id,
		}, async (err, reacts) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}

			// check for number of reaction roles in current server
			if (reacts.length >= 3 && !message.guild.premium) {
				// You need to premium to create more reaction roles
				return message.channel.send('You need premium to create more reaction roles. Premium servers get up to `10` reaction role');
			} else if (reacts.length >= 10) {
				// You have reached max amout of reaction roles in this server
				return message.channel.send('There is a max of 10 reactions roles per a server even with premium.');
			} else {
				// They can create more reaction roles
				// Make sure bot has permission to give/remove roles
				if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
					bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
					return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_ROLES').then(m => m.delete({ timeout: 10000 }));
				}

				// Make sure channel is a text channel and permission
				const channel = message.guild.channels.cache.get(message.args[0]) ? message.guild.channels.cache.get(message.args[1]) : message.channel;
				if (!channel || channel.type !== 'text' || !channel.permissionsFor(bot.user).has('VIEW_CHANNEL')) {
					return message.channel.error(settings.Language, 'MISSING_CHANNEL');
				} else if (!channel.permissionsFor(bot.user).has('SEND_MESSAGES')) {
					return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'SEND_MESSAGES').then(m => m.delete({ timeout: 10000 }));
				} else if (!channel.permissionsFor(bot.user).has('EMBED_LINKS')) {
					return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'EMBED_LINKS').then(m => m.delete({ timeout: 10000 }));
				} else if (!channel.permissionsFor(bot.user).has('ADD_REACTIONS')) {
					return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
				}

				// Get all roles mentioned
				message.channel.send(bot.translate(settings.Language, 'PLUGINS/SEND_ROLES'));

				const filter = (m) => message.author.id === m.author.id || (m.content == 'cancel' && m.author.id == message.author.id);

				// Get list of roles for reaction roles
				let roleMsgs;
				try {
					roleMsgs = await message.channel.awaitMessages(filter, {
						time: 60000,
						max: 1,
						errors: ['time'],
					});
				} catch (e) {
					return message.reply('You didn\'t send any roles in time.');
				}

				// if message was 'cancel' then stop reaction role creation
				if (roleMsgs.first().content.toLowerCase() === 'cancel') {
					return message.channel.send('Cancelled selection.');
				}

				// Validate the list of emoji for reaction roles
				roleMsgs.first().args = roleMsgs.first().content.split(' ');
				let roles =	roleMsgs.first().getRole();
				// Check role hierarchy to make sure bot can give user those roles or if the role is managed by integration (a bot role etc)
				roles = roles.filter(r => {
					if (r.comparePositionTo(message.guild.me.roles.highest) >= 0 || r.managed) {
						return false;
					} else {
						return true;
					}
				});
				// if no roles then stop reaction role creation
				if (!roles[0]) return message.channel.send('No roles entered');

				// Show what roles are being added
				const embed = new MessageEmbed()
					.setDescription([
						`Roles selected: ${roles.join(', ')}`,
						'',
						bot.translate(settings.Language, 'PLUGINS/SEND_EMOJIS'),
					].join('\n'));
				message.channel.send(embed);

				// Get list of emojis for reaction roles
				let emojiMsgs;
				try {
					emojiMsgs = await message.channel.awaitMessages(filter, {
						time: 60000,
						max: 1,
						errors: ['time'],
					});
				} catch (e) {
					return message.reply('You didn\'t send any emojis in time.');
				}

				// if message was 'cancel' then stop reaction role creation
				if (emojiMsgs.first().content.toLowerCase() === 'cancel') {
					return message.channel.send('Cancelled selection.');
				}

				// Validate the list of emoji for reaction roles
				const emojiMsg = emojiMsgs.first(),
					emojis = this.parseEmojis(emojiMsg);
				emojis.splice(emojis.length, roles.length);

				// Make sure the correct number of emojis were entered
				if (!emojis[0] || emojis.length < roles.length) return message.channel.send('An incorrect number of emojis were entered');

				// Now display message to chosen channel
				const embed2 = new MessageEmbed()
					.setTitle(bot.translate(settings.Language, 'PLUGINS/EGGLORD_REACTIONS'))
					.setDescription(bot.translate(settings.Language, 'PLUGINS/REACT_BELOW', createDescription(roles, emojis)));

				channel.send(embed2).then(async (msg) => {
					// add reactions to message embed
					for (let i = 0; i < roles.length; i++) {
						await msg.react(emojis[i]);
					}

					// create reactions data for Schema
					const reactions = [];
					for (let i = 0; i < roles.length; i++) {
						reactions.push({ roleID: roles[i].id, emoji: emojis[i] });
					}

					// save reaction role to database
					try {
						const newRR = new ReactionRoleSchema({
							guildID: message.guild.id,
							channelID: channel.id,
							messageID: msg.id,
							reactions: reactions,
						});
						await newRR.save();
						// Tell user that reaction role creation was successfully
						message.channel.send('Success!');
					} catch (err) {
						if (message.deletable) message.delete();
						bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
						message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
					}
				});
			}
			// create the description
			function createDescription(roles, emojis) {
				const strings = [];
				for (let i = 0; i < roles.length; i++) {
					strings.push(`${emojis[i]}: ${roles[i]}`);
				}

				return strings.join('\n');
			}
		});
	}

	// Get all the emojis
	parseEmojis(msg) {
		let content = msg.content.trim().split(/ +/g);

		content = content.filter((s) => {
			// Get custom emojis
			if (s.split(':').length == 3) {
				const lastTerm = s.split(':')[2].toString();
				if (msg.guild.emojis.cache.get(lastTerm.substring(0, lastTerm.length - 1))) {
					return true;
				} else {
					return false;
				}
			}
			return true;
		});

		return [...new Set(content)];
	}
};
