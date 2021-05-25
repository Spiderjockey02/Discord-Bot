// Dependencies
const fetch = require('node-fetch'),
	dateFormat = require('dateformat'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Steam extends Command {
	constructor(bot) {
		super(bot, {
			name: 'steam',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a Steam account.',
			usage: 'steam <user>',
			cooldown: 3000,
			examples: ['steam spiderjockey02', 'steam eroticgaben'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Steam config
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/steam:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// data
		const token = bot.config.api_keys.steam;

		// fetch user data
		const { response } = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${message.args.join(' ')}`)
			.then(res => res.json())
			.catch(err => {
				if (message.deletable) message.delete();
				msg.delete();
				bot.logger.error(`Command: 'steam' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			});

		// make sure user was valid
		if (!response.steamid) {
			msg.delete();
			return message.channel.error('searcher/instagram:UNKNOWN_USER').then(m => m.delete({ timeout: 10000 }));
		}

		// fetch profile data
		const { response: { players: resp } } = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${response.steamid}`)
			.then(res => res.json())
			.catch(err => {
				if (message.deletable) message.delete();
				msg.delete();
				bot.logger.error(`Command: 'steam' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			});

		// Check for user bans
		const { players: bans } = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${response.steamid}`)
			.then(res => res.json())
			.catch(err => {
				if (message.deletable) message.delete();
				msg.delete();
				bot.logger.error(`Command: 'steam' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			});

		// display data
		const embed = new Embed(bot, message.guild)
			.setColor(0x0099ff)
			.setAuthor(message.translate('searcher/steam:AUTHOR', { NAME: resp[0].personaname }), resp[0].avatarfull)
			.setThumbnail(resp[0].avatarfull)
			.setDescription(message.translate('searcher/steam:DESC', {
				NAME: resp[0].realname || 'Unknown', STATUS: message.translate('searcher/steam:STATE', { returnObjects: true })[resp[0].personastate], FLAG: resp[0].loccountrycode ? resp[0].loccountrycode.toLowerCase() : 'white', TIME: dateFormat(resp[0].timecreated * 1000, 'd/mm/yyyy (h:MM:ss TT)'), GAME_BANS: bans[0].NumberOfGameBans, VAC_BANS: bans[0].NumberOfVACBans, URL: resp[0].profileurl,
			}))
			.setTimestamp();
		msg.delete();
		message.channel.send(embed);
	}
};
