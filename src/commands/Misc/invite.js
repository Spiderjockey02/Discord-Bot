// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ functions: { genInviteLink } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Invite command
 * @extends {Command}
*/
class Invite extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'invite',
			dirname: __dirname,
			aliases: ['inv'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Send an invite link so people can add me to their server.',
			usage: 'invite',
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
		const embed = new MessageEmbed()
			.setDescription(message.translate('misc/invite:LINK', { LINK: genInviteLink(bot) }));
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
		return interaction.reply({ embeds: [{ description:guild.translate('misc/invite:LINK', { LINK: genInviteLink(bot) }) }] });
	}
}

module.exports = Invite;
