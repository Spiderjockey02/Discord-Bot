// Dependencies
const { Embed, functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * speed command
 * @extends {Command}
*/
export default class Speed extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'effects-speed',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Sets the player\'s playback speed.',
			usage: 'speed <Number>',
			cooldown: 3000,
			examples: ['speed 4'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'speed',
				description: 'The speed at what you want the song to go.',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				maxValue: 10,
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

		// Make sure song isn't a stream
		const player = client.manager?.players.get(message.guild.id);
		if (!player.queue.current.isSeekable) return message.channel.error('music/speed:LIVESTREAM');

		// Make sure Number is a number
		if (isNaN(message.args[0]) || message.args[0] < 0 || message.args[0] > 10) return message.channel.error('music/speed:INVALID');

		// Change speed value
		try {
			player.setSpeed(message.args[0]);
			const msg = await message.channel.send(message.translate('music/speed:ON_SPD'));
			const embed = new Embed(client, message.guild)
				.setDescription(message.translate('music/speed:UPDATED', { NUM: message.args[0] }));
			await client.delay(5000);
			return msg.edit({ content: ' ', embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
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
			speed = args.get('speed').value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, client);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		const player = client.manager?.players.get(member.guild.id);

		// Make sure song isn't a stream
		if (!player.queue.current.isSeekable) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/speed:LIVESTREAM', { ERROR: null }, true)] });

		// Change speed value
		try {
			player.setSpeed(speed);
			await interaction.reply({ content: guild.translate('music/speed:ON_SPD') });
			const embed = new Embed(client, guild)
				.setDescription(guild.translate('music/speed:UPDATED', { NUM: speed }));
			await client.delay(5000);
			return interaction.editReply({ content: ' ', embeds: [embed] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

