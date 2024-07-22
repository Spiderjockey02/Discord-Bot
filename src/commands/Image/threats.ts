// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Threats command
 * @extends {Command}
*/
export default class Threats extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'threats',
			dirname: __dirname,
			description: 'Creates a threat meme.',
			usage: 'threats [image]',
			cooldown: 5000,
			examples: ['threats username', 'threats <attachment>'],
			slash: true,
			options: [{
				name: 'user',
				description: 'User\'s avatar to threat.',
				type: ApplicationCommandOptionType.User,
				required: false,
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
		// Get image, defaults to author's avatar
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekoclient.xyz/api/imagegen?type=threats&url=${files[0]}`)).then(res => res.json());

			// send image in embed
			const embed = new Embed(client, message.guild)
				.setImage(json.message);
			message.channel.send({ embeds: [embed] });
		} catch(err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
		msg.delete();
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
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', { EMOJI: client.customEmojis['loading'] }) });

		try {
			const json = await fetch(encodeURI(`https://nekoclient.xyz/api/imagegen?type=threats&url=${member.user.displayAvatarURL({ format: 'png', size: 1024 })}`)).then(res => res.json());
			const embed = new Embed(client, guild)
				.setColor(3447003)
				.setImage(json.message);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}
