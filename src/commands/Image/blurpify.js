// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Blurpify extends Command {
	constructor(bot) {
		super(bot, {
			name: 'blurpify',
			dirname: __dirname,
			aliases: ['blurp'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Blurpify an image.',
			usage: 'blurpify [file]',
			cooldown: 5000,
			examples: ['blurpify <attachment>', 'blurpify username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'User\'s avatar to blurpify.',
				type: 'USER',
				required: false,
			}],
		});
	}

	// Run command
	async run(bot, message) {
		// Get image, defaults to author's avatar
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${files[0]}`)).then(res => res.json());

			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(3447003)
				.setImage(json.message);
			message.channel.send({ embeds: [embed] });
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
		msg.delete();
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${member.user.displayAvatarURL({ format: 'png', size: 1024 })}`)).then(res => res.json());
			const embed = new Embed(bot, guild)
				.setColor(3447003)
				.setImage(json.message);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
