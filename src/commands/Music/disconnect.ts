// Dependencies
const { functions: { checkMusic } } = require('../../utils'), ;
import Command from '../../structures/Command';

/**
 * Disconnect command
 * @extends {Command}
*/
export default class Disconnect extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'disconnect',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['stop', 'dc'],
			description: 'Disconnects the client from the voice channel.',
			usage: 'disconnect',
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

		// Destory player (clears queue & leaves channel)
		const player = client.manager?.players.get(message.guild.id);
		player.destroy();
		return message.channel.success('music/dc:LEFT');
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

		// Destory player (clears queue & leaves channel)
		const player = client.manager?.players.get(member.guild.id);
		player.destroy();
		interaction.reply({ embeds: [channel.success('music/dc:LEFT', null, true)] });
	}
}

