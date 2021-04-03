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
	async run(bot, message, args, settings) {
		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure data was entered
		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Make sure channel is a text channel
		const channel = message.guild.channels.cache.get(args[0]);
		if (!channel || channel.type !== 'text') {
			return message.error(settings.Language, 'MISSING_CHANNEL', settings.prefix.concat(this.help.usage));
		} else if (!channel.permissionsFor(bot.user).has(['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'])) {
			console.log('gfjhkgfdhjk');
			return message.channel.send('Missing permissions');
		}

		// Get all roles mentioned
		message.channel.send(message.translate(settings.Language, 'PLUGINS/SEND_ROLES'));

		const filter = (m) => message.author.id === m.author.id;
		const roleMsgs = await message.channel.awaitMessages(filter, {
			time: 600000,
			max: 1,
			errors: ['time'],
		});

		const roleMsg = roleMsgs.first(),
			roles = this.parseRoles(roleMsg, message.guild);

		// Get all emojis mentioned
		message.channel.send(message.translate(settings.Language, 'PLUGINS/SEND_EMOJIS'));

		const emojiMsgs = await message.channel.awaitMessages(filter, {
			time: 600000,
			max: 1,
			errors: ['time'],
		});

		const emojiMsg = emojiMsgs.first(),
			emojis = this.parseEmojis(emojiMsg);

		// Now display message to chosen channel
		const embed = new MessageEmbed()
			.setTitle(message.translate(settings.Language, 'PLUGINS/EGGLORD_REACTIONS'))
			.setDescription(message.translate(settings.Language, 'PLUGINS/REACT_BELOW', createDescription()));

		channel.send(embed).then(async (msg) => {
			emojis.forEach(async (em) => {
				await msg.react(em);

			});

			const reactions = [];
			for (let i = 0; i < roles.length; i++) {
				reactions.push({ role_id: roles[i].id, emoji: emojis[i].toString() });
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
				strings.push(`${message.guild.emojis.cache.get(emojis[i]).toString()}: ${roles[i]}`);
			}

			return strings.join('\n');
		}
	}


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
