// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Privacy extends Command {
	constructor(bot) {
		super(bot, {
			name: 'privacy',
			dirname: __dirname,
			aliases: ['priv'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends a link to the privacy policy.',
			usage: 'privacy',
			cooldown: 2000,
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// Send link to privacy policy
		const embed = new MessageEmbed()
			.setDescription(message.translate('misc/privacy:LINK', { LINK: 'https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md' }));
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const embed = new MessageEmbed()
			.setDescription(guild.translate('misc/privacy:LINK', { LINK: 'https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md' }));
		return interaction.reply({ embeds: [embed] });
	}
};
