// Dependencies
const { MessageAttachment } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

/**
 * Stickbug command
 * @extends {Command}
*/
class Stickbug extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'stickbug',
			dirname: __dirname,
			aliases: ['stick-bug'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
			description: 'Create a stickbug meme.',
			usage: 'stickbug [file]',
			cooldown: 5000,
			examples: ['stickbug username', 'stickbug <attachment>'],
			slash: true,
			options: [{
				name: 'user',
				description: 'User\'s avatar to stickbug.',
				type: 'USER',
				required: false,
			}],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Get image, defaults to author's avatar
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${files[0]}`)).then(res => res.json());

			// send image in embed
			const attachment = new MessageAttachment(json.message, 'stickbug.mp4');
			await message.channel.send({ files: [attachment] });
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
		msg.delete();
	}

	/**
 	 * Function for recieving interaction.
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
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${member.user.displayAvatarURL({ format: 'png', size: 1024 })}`)).then(res => res.json());
			const attachment = new MessageAttachment(json.message, 'stickbug.mp4');

			interaction.editReply({ content: ' ', files: [attachment] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Stickbug;
