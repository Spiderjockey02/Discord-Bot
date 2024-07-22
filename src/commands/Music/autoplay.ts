// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Autoplay command
 * @extends {Command}
*/
export default class Autoplay extends Command {
	/**
	   * @param {Client} client The instantiating client
	   * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'autoplay',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['auto-play'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Toggles autoplay mode.',
			usage: 'autoplay',
			cooldown: 3000,
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
  */
	async run(client, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, client);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		// toggle autoplay mode off and on
		const player = client.manager?.players.get(message.guild.id);
		player.setAutoplay(!player.isAutoplay, client.user);
		message.channel.send(message.translate('music/autoplay:RESP', { TOGGLE: player.isAutoplay }));
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(client, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, client);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// toggle autplay mode off and on
		const player = client.manager?.players.get(member.guild.id);
		player.setAutoplay(!player.isAutoplay, client.user);
		await interaction.reply({ content: guild.translate('music/autoplay:RESP', { TOGGLE: player.isAutoplay }) });
	}
}

