// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Undeafen extends Command {
	constructor(bot) {
		super(bot, {
			name: 'undeafen',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['undeaf', 'un-deafen'],
			userPermissions: ['DEAFEN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'DEAFEN_MEMBERS'],
			description: 'Undeafen a user.',
			usage: 'undeafen <user>',
			cooldown: 2000,
			examples: ['undeafen username'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user has deafen permission
		if (!message.member.hasPermission('DEAFEN_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'DEAFEN_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// Checks to make sure user is in the server
		const member = message.getMember();

		// Check if bot has permission to ban user
		const channel = message.guild.channels.cache.get(member[0].voice.channelID);
		if (!channel) return message.channel.send('I can\'t deafen someone not in a voice channel.');


		if (!channel.permissionsFor(bot.user).has('DEAFEN_MEMBERS')) {
			bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'DEAFEN_MEMBERS').then(m => m.delete({ timeout: 10000 }));
		}

		// try and undeafen user
		try {
			await member[0].voice.setDeaf(false);
			message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_UNDEAFEN', member[0].user).then(m => m.delete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
