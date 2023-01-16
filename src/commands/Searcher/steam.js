// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Steam command
 * @extends {Command}
*/
class Steam extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'steam',
			dirname: __dirname,
			description: 'Get information on a Steam account.',
			usage: 'steam <user>',
			cooldown: 3000,
			examples: ['steam spiderjockey02', 'steam eroticgaben'],
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
		// Steam config
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/steam:USAGE')) });

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// data
		const token = bot.config.api_keys.steam;
		const resp = await this.fetchSteamData(bot, message.guild, message.channel, token, message.args.join(' '));
		// fetch user data
		msg.delete();
		message.channel.send({ embeds: [resp] });
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
			username = args.get('username').value;

		// fetch steam account
		const token = bot.config.api_keys.steam;
		const resp = await this.fetchSteamData(bot, guild, channel, token, username);

		// send data
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {string} token API token to interact with steam API
	 * @param {string} username The username to search
	 * @returns {embed}
	*/
	async fetchSteamData(bot, guild, channel, token, username) {
		const steam = await bot.fetch('socials/steam', { username: username });

		// display data
		return new Embed(bot, guild)
			.setColor(0x0099ff)
			.setAuthor({ name: guild.translate('searcher/steam:AUTHOR', { NAME: steam.realname }), iconURL: steam.avatar })
			.setThumbnail(steam.avatar)
			.setDescription(guild.translate('searcher/steam:DESC', {
				NAME: steam.realname || 'Unknown',
				STATUS: steam.status,
				FLAG: steam.countryCode ? steam.countryCode.toLowerCase() : 'white',
				TIME: `<t:${steam.createdAt}:F>`,
				GAME_BANS: steam.bans.NumberOfGameBans, VAC_BANS: steam.bans.NumberOfVACBans,
				URL: steam.url,
			}))
			.setTimestamp();
	}
}

module.exports = Steam;
