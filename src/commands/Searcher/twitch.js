// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Twitch command
 * @extends {Command}
*/
class Twitch extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'twitch',
			dirname: __dirname,
			description: 'Get information on a twitch account.',
			usage: 'twitch <user>',
			cooldown: 3000,
			examples: ['twitch ninja'],
			slash: true,
			options: [{
				name: 'username',
				description: 'Account name',
				type: ApplicationCommandOptionType.String,
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
		// Get information on twitch accounts
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/twitch:USAGE')) });
		const user = message.args[0];

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// fetch data
		try {
			const embed = await this.fetchTwitchData(bot, message.guild, user);
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
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
		const channel = guild.channels.cache.get(interaction.channelId),
			user = args.get('username').value;

		try {
			const embed = await this.fetchTwitchData(bot, guild, user);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}

	async fetchTwitchData(bot, guild, username) {
		const twitch = await bot.fetch('socials/twitch', { username: username });

		const embed = new Embed(bot, guild)
			.setTitle(twitch.display_name)
			.setURL(`https://twitch.tv/${twitch.login}`)
			.setThumbnail(twitch.profile_image_url)
			.setAuthor({ name: 'Twitch', iconURL: 'https://i.imgur.com/4b9X738.png' })
			.addFields(
				{ name: guild.translate('searcher/twitch:BIO'), value: twitch.description || guild.translate('searcher/twitch:NO_BIO'), inline: true },
				{ name: guild.translate('searcher/twitch:TOTAL'), value: twitch.view_count.toLocaleString(guild.settings.Language), inline: true },
				{ name: guild.translate('searcher/twitch:FOLLOWERS'), value: twitch.followers.toLocaleString(guild.settings.Language), inline: true },
			);

		if (twitch.steaming) {
			embed
				.addFields(
					{ name: '\u200B', value: guild.translate('searcher/twitch:STREAMING', { TITLE: twitch.steaming.title, NUM: twitch.steaming.viewer_count }) },
				)
				.setImage(twitch.steaming.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080));
		}
		return embed;
	}
}

module.exports = Twitch;
