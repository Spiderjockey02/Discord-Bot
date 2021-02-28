// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ Warning } = require('../../modules/database/models/index'),
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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get user
		const member = message.guild.getMember(message, args);

		// get warnings of user
		try {
			await Warning.findOne({
				userID: member[0].id,
				guildID: message.guild.id,
			}, (err, warn) => {
				if(err) console.log(err);
				if (warn == null) {
					// There are no warnings with this user
					message.sendT(settings.Language, 'MODERATION/NO_WARNINGS').then(m => m.delete({ timeout: 3500 }));
				} else {
					// Warnings have been found
					let list = `Warnings (${warn.Reason.length}):\n`;
					let i = 0;
					while (warn.Reason.length != i) {
						list += `${i + 1}.) ${warn.Reason[i]} | ${(message.guild.members.cache.get(warn.Moderater[i])) ? message.guild.members.cache.get(warn.Moderater[i]) : 'User left'} (Issue date: ${warn.IssueDates[i]})\n`;
						i++;
					}
					const embed = new MessageEmbed()
						.setTitle(message.translate(settings.Language, 'MODERATION/WARNS_TITLE', member[0].user.username))
						.setDescription(list)
						.setTimestamp();
					message.channel.send(embed);
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
