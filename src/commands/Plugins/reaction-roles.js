// Dependecies
const Command = require('../../structures/Command.js'),
	{ ReactionRoleSchema } = require('../../database/models'),
	{ MessageEmbed } = require('discord.js');

module.exports = class ReactionRoles extends Command {
	constructor(bot) {
		super(bot, {
			name: 'reactionroles',
			dirname: __dirname,
			aliases: ['reaction-roles', 'rr'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Make reaction roles',
			usage: 'reactionroles <channelID>',
			cooldown: 5000,
			examples: ['reactionroles 37844848481818441'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure bot has permission to give/remove roles
		if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
			bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_ROLES').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure data was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Make sure channel is a text channel and permission
		const channel = message.guild.channels.cache.get(message.args[0]);
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

		let roleMsgs;
		try {
			roleMsgs = await message.channel.awaitMessages(filter, {
				time: 600000,
				max: 1,
				errors: ['time'],
			});
		} catch (e) {
			return message.reply('You didn\'t send any roles in time.');
		}

		if (roleMsgs.first().content.toLowerCase() === 'cancel') {
			return message.channel.send('Cancelled selection.');
		}

		const roleMsg = roleMsgs.first(),
			roles = this.parseRoles(roleMsg, message.guild);

		if (!roles[0]) return message.channel.send('No roles entered');

		// Get all emojis mentioned
		const embed = new MessageEmbed()
			.setDescription([
				`Roles selected: ${roles.join(', ')}`,
				'',
				bot.translate(settings.Language, 'PLUGINS/SEND_EMOJIS'),
			].join('\n'));
		message.channel.send(embed);

		let emojiMsgs;
		try {
			emojiMsgs = await message.channel.awaitMessages(filter, {
				time: 600000,
				max: 1,
				errors: ['time'],
			});
		} catch (e) {
			return message.reply('You didn\'t send any emojis in time.');
		}


		if (emojiMsgs.first().content.toLowerCase() === 'cancel') {
			return message.channel.send('Cancelled selection.');
		}

		const emojiMsg = emojiMsgs.first(),
			emojis = this.parseEmojis(emojiMsg);

		if (!emojis[0]) return message.channel.send('No emojis entered');

		// Now display message to chosen channel
		const embed2 = new MessageEmbed()
			.setTitle(bot.translate(settings.Language, 'PLUGINS/EGGLORD_REACTIONS'))
			.setDescription(bot.translate(settings.Language, 'PLUGINS/REACT_BELOW', createDescription()));

		channel.send(embed2).then(async (msg) => {
			emojis.forEach(async (em) => {
				await msg.react(em);

			});

			const reactions = [];
			for (let i = 0; i < roles.length; i++) {
				reactions.push({ roleID: roles[i].id, emoji: emojis[i] });
			}

			const newRR = new ReactionRoleSchema({
				guildID: message.guild.id,
				channelID: channel.id,
				messageID: msg.id,
				reactions: reactions,
			});

			newRR.save();

			// Tell user that reaction role creation was successfully
			message.channel.send('Success!');
		});

		// create the description
		function createDescription() {
			const strings = [];
			for (let i = 0; i < roles.length; i++) {
				strings.push(`${emojis[i]}: ${roles[i]}`);
			}

			return strings.join('\n');
		}
	}

	// Get all the roles
	parseRoles(msg, guild) {
		const content = msg.content.trim().split(/ +/g);

		// Remove any duplicates
		const filtered = [...new Set(content)];

		let roles = [];

		filtered.forEach(async (roleId) => {
			const role = guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId));
			roles = [...roles, role];
			return role;
		});

		return roles;
	}

	// Get all the emojis
	parseEmojis(msg) {
		let content = msg.content.trim().split(/ +/g);

		content = content.filter((s) => {
			// Remove custom emojis
			if (s.split(':').length === 1 ? false : true) {
				return false;
			}
			return true;
		});

		return [...new Set(content)];
	}
};
