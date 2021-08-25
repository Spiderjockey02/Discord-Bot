// Dependencies
const Command = require('../../structures/Command.js'),
	{ ReactionRoleSchema } = require('../../database/models'),
	{ Embed } = require('../../utils');

/**
 * Reaction role add command
 * @extends {Command}
*/
class ReactionRoleAdd extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rr-add',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['reactionroles-add'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES'],
			description: 'Create a reaction role',
			usage: 'rr-add [channelID / message link]',
			cooldown: 5000,
			examples: ['rr-add 3784484	8481818441'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// check if the guild has reached max reaction roles
		await ReactionRoleSchema.find({
			guildID: message.guild.id,
		}, async (err, reacts) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// check for number of reaction roles in current server
			if (reacts.length >= 3 && !message.guild.premium) {
				// You need to premium to create more reaction roles
				return message.channel.send(message.translate('plugins/rr-add:NEED_PREMIUM'));
			} else if (reacts.length >= 10) {
				// You have reached max amout of reaction roles in this server
				return message.channel.send(message.translate('plugins/rr-add:MAX_RR'));
			} else {
				// They can create more reaction roles
				// Fetch channel for reaction role
				const patt = /https?:\/\/(?:(?:canary|ptb|www)\.)?discord(?:app)?\.com\/channels\/(?:@me|(?<g>\d+))\/(?<c>\d+)\/(?<m>\d+)/g;
				let channel, msgLink;
				if (patt.test(message.args[0])) {
					console.log('test');
					const stuff = message.args[0].split('/');
					msgLink = await bot.guilds.cache.get(stuff[4])?.channels.cache.get(stuff[5])?.messages.fetch(stuff[6]);
					if (!msgLink) return message.channel.error('Incorrect message link.');
					channel = msgLink.channel;
				} else {
					channel = message.guild.channels.cache.get(message.args[0]) ?? message.channel;
				}

				// Make sure channel is a text channel and permission
				if (!(channel || channel.isText() || channel.permissionsFor(bot.user).has('VIEW_CHANNEL'))) {
					return message.channel.error('misc:MISSING_CHANNEL');
				} else if (!channel.permissionsFor(bot.user).has('SEND_MESSAGES')) {
					return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:SEND_MESSAGES') }).then(m => m.timedDelete({ timeout: 10000 }));
				} else if (!channel.permissionsFor(bot.user).has('EMBED_LINKS')) {
					return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:EMBED_LINKS') }).then(m => m.timedDelete({ timeout: 10000 }));
				} else if (!channel.permissionsFor(bot.user).has('ADD_REACTIONS')) {
					return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:ADD_REACTIONS') }).then(m => m.timedDelete({ timeout: 10000 }));
				}

				// Get all roles mentioned
				message.channel.send(message.translate('plugins/rr-add:SEND_ROLES'));

				const filter = (m) => message.author.id === m.author.id || (m.content == 'cancel' && m.author.id == message.author.id);

				// Get list of roles for reaction roles
				let roleMsgs;
				try {
					roleMsgs = await message.channel.awaitMessages({
						filter,
						time: 60000,
						max: 1,
						errors: ['time'],
					});
				} catch (e) {
					return message.reply(message.translate('misc:WAITED_TOO_LONG'));
				}

				// if message was 'cancel' then stop reaction role creation
				if (roleMsgs.first().content.toLowerCase() === 'cancel') {
					return message.channel.send(message.translate('misc:CANCELLED'));
				}

				// Validate the list of emoji for reaction roles
				roleMsgs.first().args = roleMsgs.first().content.split(' ');
				let roles =	roleMsgs.first().getRole();
				// Check role hierarchy to make sure bot can give user those roles or if the role is managed by integration (a bot role etc)
				roles = roles.filter(r => {
					return !(r.comparePositionTo(message.guild.me.roles.highest) >= 0 || r.managed);
				});
				// if no roles then stop reaction role creation
				if (!roles[0]) return message.channel.send('No roles entered');

				// Show what roles are being added
				const embed = new Embed(bot, message.guild)
					.setDescription([
						`Roles selected: ${roles.join(', ')}`,
						'',
						message.translate('plugins/rr-add:SEND_EMOJIS'),
					].join('\n'));
				message.channel.send({ embeds: [embed] });

				// Get list of emojis for reaction roles
				let emojiMsgs;
				try {
					emojiMsgs = await message.channel.awaitMessages({
						filter,
						time: 60000,
						max: 1,
						errors: ['time'],
					});
				} catch (e) {
					return message.reply(message.translate('misc:WAITED_TOO_LONG'));
				}

				// if message was 'cancel' then stop reaction role creation
				if (emojiMsgs.first().content.toLowerCase() === 'cancel') {
					return message.channel.send(message.translate('misc:CANCELLED'));
				}

				// Validate the list of emoji for reaction roles
				const emojiMsg = emojiMsgs.first(),
					emojis = this.parseEmojis(emojiMsg);
				emojis.splice(emojis.length, roles.length);

				// Make sure the correct number of emojis were entered
				if (!emojis[0] || emojis.length < roles.length) return message.channel.send(message.translate('plugins/rr-add:INCORRECT_EMOJIS'));

				// Now display message to chosen channel
				const embed2 = new Embed(bot, message.guild)
					.setTitle('plugins/rr-add:TITLE')
					.setDescription([
						message.translate('plugins/rr-add:REACT_BELOW'),
						createDescription(roles, emojis),
					].join('\n'));

				// Whether or not bot needs to make an embed or use existing one
				let msg;
				if (patt.test(message.args[0])) {
					msg = msgLink;
				} else {
					msg = await channel.send({ embeds: [embed2] });
				}

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
				} catch (err) {
					if (message.deletable) message.delete();
					msg.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
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
				return msg.guild.emojis.cache.get(lastTerm.substring(0, lastTerm.length - 1));
			}
			return true;
		});

		return [...new Set(content)];
	}
}

module.exports = ReactionRoleAdd;
