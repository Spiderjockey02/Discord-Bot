// Dependencies
const { Embed, functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * volume command
 * @extends {Command}
*/
export default class Volume extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'volume',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['vol'],
			description: 'Changes the volume of the song',
			usage: 'volume <Number>',
			cooldown: 3000,
			examples: ['volume 50'],
			slash: true,
			options: [{
				name: 'volume',
				description: 'The volume you want the song to play at.',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				maxValue: 1000,
				required: true,
			}],
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

		const player = client.manager?.players.get(message.guild.id);

		// Make sure a number was entered
		if (!message.args[0]) {
			const embed = new Embed(client, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/volume:CURRENT', { NUM: player.volume }));
			return message.channel.send({ embeds: [embed] });
		}

		// make sure the number was between 0 and 1000
		if (Number(message.args[0]) <= 0 || Number(message.args[0]) > 1000) return message.channel.error('music/volume:TOO_HIGH');

		// Update volume
		player.setVolume(Number(message.args));
		const embed = new Embed(client, message.guild)
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate('music/volume:UPDATED', { NUM: player.volume }));
		return message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			volume = args.get('volume').value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, client);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Make sure a number was entered
		const player = client.manager?.players.get(member.guild.id);
		if (!volume) {
			const embed = new Embed(client, guild)
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/volume:CURRENT', { NUM: player.volume }));
			return interaction.reply({ embeds: [embed] });
		}

		// Update volume
		player.setVolume(volume);
		const embed = new Embed(client, guild)
			.setColor(member.displayHexColor)
			.setDescription(guild.translate('music/volume:UPDATED', { NUM: player.volume }));
		return interaction.reply({ embeds: [embed] });
	}
}

