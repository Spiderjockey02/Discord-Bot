// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Lock command
 * @extends {Command}
*/
class Lock extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'lock',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lockdown'],
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Lockdown a channel',
			usage: 'lock [channel]',
			cooldown: 5000,
			examples: ['lock @channel'],
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

		// Get channel and update permissions
		const channel = message.getChannel()[0];
		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				SEND_MESSAGES: false,
			});
			for (const role of settings.welcomeRoleGive) {
				await channel.permissionOverwrites.edit(role, {
					SEND_MESSAGES: false,
				});
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Lock;
