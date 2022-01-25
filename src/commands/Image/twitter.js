// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

/**
 * Twitter command
 * @extends {Command}
*/
class Twitter extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'twitter',
			dirname: __dirname,
			aliases: ['tweet'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Twitter tweet.',
			usage: 'twitter [user] <text>',
			cooldown: 5000,
			examples: ['twitter username I don\'t like twitter.'],
			slash: true,
			options: [{
				name: 'user',
				description: 'User who made tweet',
				type: 'USER',
				required: true,
			}, {
				name: 'text',
				description: 'tweet content',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Get user
		const members = await message.getMember();
		if (message.args.join(' ').replace(/<@.?\d*?>/g, '').length == message.args.length) message.args.shift();

		// Get text
		const text = message.args.join(' ').replace(/<@.?\d*?>/g, '');

		// make sure text was entered
		if (message.args.length == 0) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/twitter:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// make sure the text isn't longer than 60 characters
		if (text.length >= 61) return message.channel.error('image/twitter:TOO_LONG').then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${members[0].user.username}&text=${text}`)).then(res => res.json());

			// send image in embed
			const embed = new Embed(bot, message.guild)
				.setImage(json.message);
			message.channel.send({ embeds: [embed] });
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
		const member = guild.members.cache.get(args.get('user').value);
		const text = args.get('text').value;
		const channel = guild.channels.cache.get(interaction.channelId);

		// make sure the text isn't longer than 80 characters
		if (text.length >= 61) return interaction.reply({ embeds: [channel.error('image/twitter:TOO_LONG', {}, true)], ephemeral: true });

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${member.user.username}&text=${text}`)).then(res => res.json());
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

module.exports = Twitter;
