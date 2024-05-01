// Dependencies
const { EmbedBuilder } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'), ;
import Command from '../../structures/Command';

/**
 * shuffle command
 * @extends {Command}
*/
export default class Shuffle extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'shuffle',
			guildOnly: true,
			dirname: __dirname,
			description: 'Shuffles the playlist.',
			usage: 'shuffle',
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
		// check to make sure client can play music based on permissions
		const playable = checkMusic(message.member, client);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		// shuffle queue
		const player = client.manager?.players.get(message.guild.id);
		player.queue.shuffle();
		const embed = new EmbedBuilder()
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate('music/shuffle:DESC'));
		message.channel.send({ embeds: [embed] });
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

		// shuffle queue
		const player = client.manager?.players.get(member.guild.id);
		player.queue.shuffle();
		const embed = new EmbedBuilder()
			.setColor(member.displayHexColor)
			.setDescription(guild.translate('music/shuffle:DESC'));
		interaction.reply({ embeds: [embed] });
	}
}

