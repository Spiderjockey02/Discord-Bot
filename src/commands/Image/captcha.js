// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Captcha command
 * @extends {Command}
*/
class Captcha extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'captcha',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Create a captcha image.',
			usage: 'captcha',
			cooldown: 5000,
			examples: ['captcha userID', 'captcha @mention', 'captcha username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'User\'s avatar for captcha card.',
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
	async run(bot, message) {
		// Get user
		const members = await message.getMember();

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${members[0].user.username}&url=${members[0].user.displayAvatarURL({ format: 'png', size: 512 })}`)).then(res => res.json());

			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(9807270)
				.setImage(json.message);
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
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
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${member.user.username}&url=${member.user.displayAvatarURL({ format: 'png', size: 512 })}`)).then(res => res.json());
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

module.exports = Captcha;
