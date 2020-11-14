// Dependencies
const fetch = require('node-fetch');
const dateFormat = require('dateformat');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Steam config
	if (!args[0])	return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('steam').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	const r = await message.channel.send('Gathering account...');
	const token = bot.config.api_keys.steam;
	const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${args.join(' ')}`;

	// fetch user data
	fetch(url).then(res => res.json()).then(body => {
		if (body.response.success === 42) {
			r.delete();
			return message.error(settings.Language, 'SEARCHER/UNKNOWN_USER').then(m => m.delete({ timeout: 10000 }));
		}
		const id = body.response.steamid;
		const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
		const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
		const state = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to trade', 'Looking to play'];

		// fetch personal data
		fetch(summaries).then(res => res.json()).then(body2 => {
			if (!body2.response) {
				r.delete();
				return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
			const { personaname, avatarfull, realname, personastate, loccountrycode, profileurl, timecreated } = body2.response.players[0];

			// fetch bans
			fetch(bans).then(res => res.json()).then(body3 => {
				if (!body3.players) {
					r.delete();
					return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
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
				r.delete();
				message.channel.send(embed);
			});
		});
	});
};

module.exports.config = {
	command: 'steam',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Steam',
	category: 'Searcher',
	description: 'Get information on a Steam account.',
	usage: '${PREFIX}steam <user>',
};
