// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Deafen extends Command {
	constructor(bot) {
		super(bot, {
			name: 'deafen',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: ['DEAFEN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'DEAFEN_MEMBERS'],
			description: 'Deafen a user.',
			usage: 'deafen <user> [time]',
			cooldown: 2000,
			examples: ['deafen username', 'deafen username 5m'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user has deafen permission
		if (!message.member.hasPermission('DEAFEN_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'DEAFEN_MEMBERS').then(m => setTimeout(() => { m.delete(); }, 10000));


		// Checks to make sure user is in the server
		const member = message.getMember();

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(member[0].voice.channelID);
		if (!channel) return message.channel.send('I can\'t deafen someone not in a voice channel.');

		// Make sure bot can deafen members
		if (!channel.permissionsFor(bot.user).has('DEAFEN_MEMBERS')) {
			bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'DEAFEN_MEMBERS').then(m => setTimeout(() => { m.delete(); }, 10000));
		}

		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.channel.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => setTimeout(() => { m.delete(); }, 10000));

		// Make sure that the user is in a voice channel
		if (member[0].voice.channelID) {
			try {
				await member[0].voice.setDeaf(true);
				message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_DEAFEN', member[0].user).then(m => setTimeout(() => { m.delete(); }, 3000)
);
				// eslint-disable-next-line no-empty
			} catch(e) {}
		} else {
			message.channel.error(settings.Language, 'MODERATION/NOT_INVOICE', member[0].user).then(m => setTimeout(() => { m.delete(); }, 3000)
);
		}
	}
};
