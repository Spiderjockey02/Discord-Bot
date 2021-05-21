// Dependencies
const fetch = require('node-fetch'),
	dateFormat = require('dateformat'),
	{ MessageEmbed } = require('discord.js'),
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
		if (!message.args[0])	return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name} account info...`);

		// data
		const token = bot.config.api_keys.steam;
		const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${message.args.join(' ')}`;

		// fetch user data
		fetch(url).then(res => res.json()).then(body => {
			if (body.response.success === 42) {
				msg.delete();
				return message.channel.error(settings.Language, 'SEARCHER/UNKNOWN_USER').then(m => setTimeout(() => { m.delete(); }, 10000));
			}
			const id = body.response.steamid;
			const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
			const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
			const state = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to trade', 'Looking to play'];

			// fetch personal data
			fetch(summaries).then(res => res.json()).then(body2 => {
				if (!body2.response) {
					msg.delete();
					message.channel.error(settings.Language, 'ERROR_MESSAGE', 'Missing user data').then(m => setTimeout(() => { m.delete(); }, 5000));
				}
				const { personaname, avatarfull, realname, personastate, loccountrycode, profileurl, timecreated } = body2.response.players[0];

				// fetch bans
				fetch(bans).then(res => res.json()).then(body3 => {
					if (!body3.players) {
						msg.delete();
						message.channel.error(settings.Language, 'ERROR_MESSAGE', 'Missing user ban data').then(m => setTimeout(() => { m.delete(); }, 5000));
					}
					const { NumberOfGameBans } = body3.players[0];
					// Display results
					const embed = new MessageEmbed()
						.setColor(0x0099ff)
						.setAuthor(`Steam Services | ${personaname}`, avatarfull)
						.setThumbnail(avatarfull)
						.setDescription(`**Real name:** ${realname || 'Unknown'}\n
						**Status:** ${state[personastate]}\n
						**Country:** :flag_${loccountrycode ? loccountrycode.toLowerCase() : 'white'}:\n
						**Account Created:** ${dateFormat(timecreated * 1000, 'd/mm/yyyy (h:MM:ss TT)')}\n
						**Bans:** Vac: ${NumberOfGameBans}, Game: ${NumberOfGameBans} \n
						**Link:** [Link to profile](${profileurl})`)
						.setTimestamp();
					msg.delete();
					message.channel.send(embed);
				});
			});
		});
	}
};
