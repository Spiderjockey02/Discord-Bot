// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Firstmessage extends Command {
	constructor(bot) {
		super(bot, {
			name: 'firstmessage',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['firstmsg', 'first-msg'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets the first message from the channel.',
			usage: 'firstmessage [channel]',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// get channel
		const channel = message.getChannel();

		try {
			// get first message in current channel
			const fMessage = await channel[0].messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());
			const embed = new MessageEmbed()
				.setColor(fMessage.member ? fMessage.member.displayHexColor : 0x00AE86)
				.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
				.setAuthor(fMessage.author.tag, fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
				.setDescription(fMessage.content)
				.setTimestamp(fMessage.createdAt)
				.setFooter(`ID: ${fMessage.id}`)
				.addField('❯ Jump', fMessage.url);
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
