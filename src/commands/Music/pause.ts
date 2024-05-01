// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * pause command
 * @extends {Command}
*/
export default class Pause extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'pause',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Pauses the music.',
			usage: 'pause',
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
	async run(client, message, settings) {
		// check to make sure client can play music based on permissions
		const playable = checkMusic(message.member, client);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		const player = client.manager?.players.get(message.guild.id);

		// The music is already paused
		if (player.paused) return message.channel.error('music/pause:IS_PAUSED', { PREFIX: settings.prefix });

		// Pauses the music
		player.pause(true);
		return message.channel.success('music/pause:SUCCESS');
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

		// The music is already paused
		const player = client.manager?.players.get(member.guild.id);
		if (player.paused) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/pause:IS_PAUSED', {}, true)] });

		// Pauses the music
		player.pause(true);
		return interaction.reply({ embeds: [channel.success('music/pause:SUCCESS', {}, true)] });
	}
}

