// Dependencies
const	{ Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * PHcomment command
 * @extends {Command}
*/
class PHcomment extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'phcomment',
			dirname: __dirname,
			aliases: ['ph', 'ph-comment'],
			description: 'Create a fake Pornhub comment.',
			usage: 'phcomment [user] <text>',
			cooldown: 5000,
			examples: ['phcomment username Wow nice'],
			slash: true,
			options: [{
				name: 'user',
				description: 'User who made comment',
				type: ApplicationCommandOptionType.User,
				required: true,
			}, {
				name: 'text',
				description: 'comment content',
				type: ApplicationCommandOptionType.String,
				maxLength: 71,
				required: true,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Get user
		const members = await message.getMember();

		// Get text
		const text = message.args.join(' ').replace(/<@.?\d*?>/g, '');

		// Make sure text was entered
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/phcomment:USAGE')) });

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.channel.error('image/phcomment:TOO_LONG');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${members[0].user.displayName}&image=${members[0].user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`)).then(res => res.json());

			// send image in embed
			const embed = new Embed(bot, message.guild)
				.setImage(json.message);
			message.channel.send({ embeds: [embed] });
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
			text = args.get('text').value,
			channel = guild.channels.cache.get(interaction.channelId);

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', { EMOJI: bot.customEmojis['loading'] }) });

		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${member.user.displayName}&image=${member.user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`)).then(res => res.json());
			const embed = new Embed(bot, guild)
				.setColor(3447003)
				.setImage(json.message);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = PHcomment;
