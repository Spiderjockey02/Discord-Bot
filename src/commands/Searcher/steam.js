// Dependencies
const fetch = require('node-fetch'),
	dateFormat = require('dateformat'),
	{ Embed } = require('../../utils'),
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
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a Steam account.',
			usage: 'steam <user>',
			cooldown: 3000,
			examples: ['steam spiderjockey02', 'steam eroticgaben'],
			slash: true,
			options: [{
				name: 'username',
				description: 'Account name',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Steam config
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/steam:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

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
 	 * Function for recieving interaction.
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
		const { response } = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${username}`)
			.then(res => res.json())
			.catch(err => {
				bot.logger.error(`Command: 'steam' has error: ${err.message}.`);
				return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
			});

		// make sure user was valid
		if (!response.steamid) {
			return channel.error('searcher/instagram:UNKNOWN_USER', {}, true);
		}

		// fetch profile data
		const { response: { players: resp } } = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${response.steamid}`)
			.then(res => res.json())
			.catch(err => {
				bot.logger.error(`Command: 'steam' has error: ${err.message}.`);
				return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
			});

		// Check for user bans
		const { players: bans } = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${response.steamid}`)
			.then(res => res.json())
			.catch(err => {
				bot.logger.error(`Command: 'steam' has error: ${err.message}.`);
				return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
			});

		// display data
		return new Embed(bot, guild)
			.setColor(0x0099ff)
			.setAuthor({ name: guild.translate('searcher/steam:AUTHOR', { NAME: resp[0].personaname }), iconURL: resp[0].avatarfull })
			.setThumbnail(resp[0].avatarfull)
			.setDescription(guild.translate('searcher/steam:DESC', {
				NAME: resp[0].realname || 'Unknown', STATUS: guild.translate('searcher/steam:STATE', { returnObjects: true })[resp[0].personastate], FLAG: resp[0].loccountrycode ? resp[0].loccountrycode.toLowerCase() : 'white', TIME: dateFormat(resp[0].timecreated * 1000, 'd/mm/yyyy (h:MM:ss TT)'), GAME_BANS: bans[0].NumberOfGameBans, VAC_BANS: bans[0].NumberOfVACBans, URL: resp[0].profileurl,
			}))
			.setTimestamp();
	}
}

module.exports = Steam;
