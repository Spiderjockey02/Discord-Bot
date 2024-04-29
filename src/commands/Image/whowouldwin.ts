// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * WhoWouldWin command
 * @extends {Command}
*/
class WhoWouldWin extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'whowouldwin',
			dirname: __dirname,
			aliases: ['www'],
			description: 'Create a whowouldwin image.',
			usage: 'whowouldwin <user1> [user2]',
			cooldown: 5000,
			examples: ['whowouldwin username username', 'whowouldwin username <attachment>'],
			slash: true,
			options: [{
				name: 'user',
				description: 'first user.',
				type: ApplicationCommandOptionType.User,
				required: true,
			}, {
				name: 'user2',
				description: 'second user',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Get user
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		if (!files[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/whowouldwin:USAGE')) });

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const resp = await bot.fetch('image/whowouldwin', { image1: files[0], image2: files[1] });

			// Check if an object was sent instead (probs an error)
			const isObject = typeof resp.toString() == 'object';
			if (isObject) {
				const possibleError = JSON.parse(resp.toString())?.error;
				if (possibleError) throw new Error(possibleError);
			}

			const attachment = new AttachmentBuilder(Buffer.from(resp, 'base64'), { name: 'whowouldwin.png' });
			const embed = new Embed(bot, message.guild)
				.setImage('attachment://whowouldwin.png');
			message.channel.send({ embeds: [embed], files: [attachment] });
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
		msg.delete();
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value),
			member2 = guild.members.cache.get(args.get('user2')?.value ?? interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', { EMOJI: bot.customEmojis['loading'] }) });

		try {
			const resp = await bot.fetch('image/whowouldwin', { image1: member.user.displayAvatarURL({ format: 'png', size: 1024 }), image2:  member2.user.displayAvatarURL({ format: 'png', size: 512 }) });

			// Check if an object was sent instead (probs an error)
			const isObject = typeof resp.toString() == 'object';
			if (isObject) {
				const possibleError = JSON.parse(resp.toString())?.error;
				if (possibleError) throw new Error(possibleError);
			}

			const attachment = new AttachmentBuilder(Buffer.from(resp, 'base64'), { name: 'whowouldwin.png' });
			const embed = new Embed(bot, guild)
				.setImage('attachment://whowouldwin.png');
			interaction.editReply({ content: ' ', embeds: [embed], files: [attachment] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = WhoWouldWin;
