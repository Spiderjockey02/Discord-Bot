// Dependencies
const { Embed } = require('../../utils'),
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
	async run(bot, message) {
		// get channel
		const channel = message.getChannel();

		try {
			// get first message in channel
			const fMessage = await channel[0].messages.fetch({ after: 1, limit: 1 }).then(msg => msg.first());

			// display information
			const embed = new Embed(bot, message.guild)
				.setColor(fMessage.member ? fMessage.member.displayHexColor : 0x00AE86)
				.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
				.setAuthor(fMessage.author.tag, fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
				.setDescription(fMessage.content)
				.addField(message.translate('guild/firstmessage:JUMP'), fMessage.url)
				.setFooter('misc:ID', { ID: fMessage.id })
				.setTimestamp(fMessage.createdAt);
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
