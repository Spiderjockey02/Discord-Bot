// Dependencies
const { MutedMemberSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Unmute extends Command {
	constructor(bot) {
		super(bot, {
			name:  'unmute',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-mute'],
			userPermissions: ['MUTE_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MUTE_MEMBERS', 'MANAGE_ROLES'],
			description: 'Unmute a user.',
			usage: 'unmute <user>',
			cooldown: 2000,
			examples: ['unmute username'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user can mute users
		if (!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// check if bot can add 'mute' role to user
		if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
			bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_ROLES').then(m => m.delete({ timeout: 10000 }));
		}

		// Find user
		const member = message.getMember();

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(member[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Remove mutedRole from user
		try {
			const muteRole = message.guild.roles.cache.get(settings.MutedRole);
			member[0].roles.remove(muteRole);

			// delete muted member from database
			await MutedMemberSchema.findOneAndRemove({ userID: member[0].user.id,	guildID: message.guild.id });

			// if in a VC unmute them
			if (member[0].voice.channelID) member[0].voice.setMute(false);

			message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_UNMUTE', member[0].user).then(m => m.delete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
