// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Nick extends Command {
	constructor(bot) {
		super(bot, {
			name: 'nick',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['nickname', 'setnick'],
			userPermissions: ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_NICKNAMES'],
			description: 'Change the nickname of a user.',
			usage: 'nick <user> <name>',
			cooldown: 3000,
			examples: ['nick username Not a nice name'],
			options: [{
				name: 'nickname',
				description: 'The nickname you want to set.',
				type: 'STRING',
				required: true,
			}],
			defaultPermission: false,
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Get user for nickname change
		const members = await message.getMember();

		// Make sure user user does not have ADMINISTRATOR permissions
		if (members[0].hasPermission('ADMINISTRATOR') || (members[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) > 0)) {
			return message.channel.error('moderation/nick:TOO_POWERFUL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Make sure a nickname was provided in the command
		if (message.args.length == 0) return message.channel.error('moderation/nick:ENTER_NICKNAME').then(m => m.timedDelete({ timeout: 10000 }));

		// Get the nickanme
		const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

		// Make sure nickname is NOT longer than 32 characters
		if (nickname.length >= 32) return message.channel.error('moderation/nick:LONG_NICKNAME').then(m => m.timedDelete({ timeout: 5000 }));

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await members[0].setNickname(nickname);
			message.channel.success('moderation/nick:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 5000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value),
			nickname = args.get('nickname').value,
			channel = guild.channels.cache.get(interaction.channelID);

		// Make sure user user does not have ADMINISTRATOR permissions
		if (member.hasPermission('ADMINISTRATOR') || (member.roles.highest.comparePositionTo(guild.me.roles.highest) > 0)) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('moderation/nick:TOO_POWERFUL', { ERROR: null }, true)] });
		}

		// Make sure the nickname is NOT longer than 32 characters.
		if (nickname.length >= 32) return interaction.reply({ ephemeral: true, embeds: [channel.error('moderation/nick:LONG_NICKNAME', { ERROR: null }, true)] });

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await member.setNickname(nickname);
			return interaction.reply({ ephemeral: guild.settings.ModerationClearToggle, embeds: [channel.success('moderation/nick:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
