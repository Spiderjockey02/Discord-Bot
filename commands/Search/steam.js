// dependencies
const fetch = require('node-fetch');
const dateFormat = require('dateformat');
const Discord = require('discord.js');
module.exports.run = async (bot, message, args) => {
	// Steam config
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('steam').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const r = await message.channel.send('Gathering account...');
	const token = bot.config.SteamAPI;
	const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${args.join(' ')}`;
	fetch(url).then(res => res.json()).then(body => {
		if (body.response.success === 42) {
			r.delete();
			message.channel.send('I was unable to find a steam profile with that name').then(m => m.delete({ timeout: 2000 }));
			return;
		}
		const id = body.response.steamid;
		const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
		const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
		const state = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to trade', 'Looking to play'];
		fetch(summaries).then(res => res.json()).then(body2 => {
			if (!body2.response) {
				r.delete();
				message.channel.send('I was unable to find a steam profile with that name').then(m => m.delete({ timeout: 2000 }));
				return;
			}
			const { personaname, avatarfull, realname, personastate, loccountrycode, profileurl, timecreated } = body.response.players[0];
			fetch(bans).then(res => res.json()).then(body3 => {
				if (!body3.players) {
					r.delete();
					message.channel.send('I was unable to find a steam profile with that name').then(m => m.delete({ timeout: 2000 }));
					return;
				}
				const { NumberOfGameBans } = body.players[0];
				// Display results
				const embed = new Discord.MessageEmbed()
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
	aliases: ['steam'],
};
module.exports.help = {
	name: 'Steam',
	category: 'Search',
	description: 'Get information on a steam account',
	usage: '!steam [user]',
};
