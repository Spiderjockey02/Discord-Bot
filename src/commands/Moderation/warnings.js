// Dependencies
const { Embed } = require('../../utils'),
	{ WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Warnings extends Command {
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

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

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
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				}

				if (!warn[0]) {
					// There are no warnings with this user
					message.channel.send(bot.translate('moderation:warnings/NO_WARNINGS')).then(m => m.delete({ timeout: 3500 }));
				} else {
					// Warnings have been found
					let list = `Warnings (${warn.length}):\n`;
					for (let i = 0; i < warn.length; i++) {
						list += `${i + 1}.) ${warn[i].Reason} | ${(message.guild.members.cache.get(warn[i].Moderater)) ? message.guild.members.cache.get(warn[i].Moderater) : 'User left'} (Issue date: ${warn[i].IssueDate})\n`;
					}

					const embed = new Embed(bot, message.guild)
						.setTitle('moderation/warns:TITLE', { USER: members[0].user.username })
						.setDescription(list)
						.setTimestamp();
					message.channel.send(embed);
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
