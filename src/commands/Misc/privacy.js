// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Privacy command
 * @extends {Command}
*/
class Privacy extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
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

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Send link to privacy policy
		const embed = new MessageEmbed()
			.setDescription(message.translate('misc/privacy:LINK', { LINK: 'https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md' }));
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const embed = new MessageEmbed()
			.setDescription(guild.translate('misc/privacy:LINK', { LINK: 'https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md' }));
		return interaction.reply({ embeds: [embed] });
	}
}

module.exports = Privacy;
