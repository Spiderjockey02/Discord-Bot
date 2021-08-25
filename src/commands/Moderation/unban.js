// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Unban command
 * @extends {Command}
*/
class Unban extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'unban',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-ban'],
			userPermissions: ['BAN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
			description: 'Unban a user.',
			usage: 'unban <userID> [reason]',
			cooldown: 5000,
			examples: ['unban 184376969016639488'],
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

		// Unban user
		const user = message.args[0];
		try {
			await message.guild.bans.fetch().then(async bans => {
				if (bans.size == 0) return message.channel.error('moderation/unban:NO_ONE');
				const bUser = bans.find(ban => ban.user.id == user);
				if (bUser) {
					await message.guild.members.unban(bUser.user);
					message.channel.success('moderation/unban:SUCCESS', { USER: bUser.user }).then(m => m.timedDelete({ timeout: 3000 }));
				} else {
					message.channel.error('moderation/unban:MISSING', { ID: user });
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Unban;
