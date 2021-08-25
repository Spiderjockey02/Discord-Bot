// Dependencies
const { Embed } = require('../../utils'),
	{ WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

/**
 * Warnings command
 * @extends {Command}
*/
class Warnings extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'warnings',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['warns'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Display number of warnings a user has.',
			usage: 'warnings [user]',
			cooldown: 2000,
			examples: ['warnings username'],
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

		// Get user
		const members = await message.getMember();

		// get warnings of user
		try {
			await WarningSchema.find({
				userID: members[0].id,
				guildID: message.guild.id,
			}, (err, warn) => {
				// if an error occured
				if (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}

				if (!warn[0]) {
					// There are no warnings with this user
					message.channel.error('moderation/warnings:NO_WARNINGS').then(m => m.timedDelete({ timeout: 3500 }));
				} else {
					// Warnings have been found
					let list = `Warnings (${warn.length}):\n`;
					for (let i = 0; i < warn.length; i++) {
						list += `${i + 1}.) ${warn[i].Reason} | ${(message.guild.members.cache.get(warn[i].Moderater)) ? message.guild.members.cache.get(warn[i].Moderater) : 'User left'} (Issue date: ${warn[i].IssueDate})\n`;
					}

					const embed = new Embed(bot, message.guild)
						.setTitle('moderation/warnings:TITLE', { USER: members[0].user.username })
						.setDescription(list)
						.setTimestamp();
					message.channel.send({ embeds: [embed] });
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Warnings;
