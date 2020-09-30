const Discord = require('discord.js');
const R6API = require('r6api.js');
const { getId, getLevel, getRank, getStats } = new R6API('benjamin.forey11@gmail.com', 'benjaminF11');
module.exports.run = async (bot, message, args) => {
	// Get platforms and regions (just make it easier for users to use this command)
	const platforms = { pc: 'UPLAY', xbox: 'XBL', ps4:'PSN' };
	const regions = { eu: 'emea', na: 'ncsa', as: 'apac' };
	let player, platform, region;
	// Checks to make sure a username was entered
	if (!args[0]) {
		message.delete();
		message.channel.send('Please specify a username to search').then(m => m.delete({ timeout: 2000 }));
		return;
	} else {
		player = args[0];
	}
	// Get platform
	// Presets
	platform = platforms['pc'];
	region = regions['eu'];
	for (let i = 0; i < args.length; i++) {
		// Get Console
		if (['pc', 'xbox', 'ps4'].includes(args[i].toLowerCase())) {
			// console has been found
			platform = platforms[args[i].toLowerCase()];
			args.splice(i);
		}
	}
	for (let i = 0; i < args.length; i++) {
		// get region
		if (['eu', 'na', 'as'].includes(args[i].toLowerCase())) {
			region = regions[args[i].toLowerCase()];
			args.splice(i);
		}
	}
	console.log(args);
	player = args.join(' ');
	console.log(player);
	if(platform === 'xbl') player = player.replace('_', '');
	player = await getId(platform, player);
	// Makes sure that user actually exist
	if(!player.length) {
		message.delete();
		message.channel.send('Couldn\'t fetch results for that user.').then(m => m.delete({ timeout: 2500 }));
		return;
	}
	const r = await message.channel.send('Gathering results...');
	player = player[0];
	const playerRank = await getRank(platform, player.id);
	const playerStats = await getStats(platform, player.id);
	const playerGame = await getLevel(platform, player.id);

	if (!playerRank.length || !playerStats.length || !playerGame.length) {
		r.delete();
		message.delete();
		message.channel.send('I was unable to fetch the appropriate data. Please try again').then(m => m.delete({ timeout: 2500 }));
		return;
	}
	const { current, max } = playerRank[0].seasons[Object.keys(playerRank[0].seasons)[0]].regions[ region ];
	const { pvp, pve } = playerStats[0];
	const { level, xp } = playerGame[0];

	platform = Object.keys(platforms).find(key => platforms[key] === platform).toLowerCase();
	region = Object.keys(regions).find(key => regions[key] === region).toLowerCase();

	const embed = new Discord.MessageEmbed()
		.setAuthor(player.username, bot.user.displayAvatarURL)
		.setDescription(`Stats for the **${region.toUpperCase()}** region on **${platform.toUpperCase()}**`)
		.setThumbnail(current.image)
		.addField('General:', `**Level:** ${level} (${xp} xp) \n**Rank:** ${current.name} (Max: ${max.name}) \n**MMR:** ${current.mmr}`)
		.addField('Statistics:', `**Wins:** ${pvp.general.wins} \n**Losses:** ${pvp.general.losses} \n**Win/Loss ratio:** ${(pvp.general.wins / pvp.general.matches * 100).toFixed(2)} \n**Kills** ${pvp.general.kills} \n**Deaths:** ${pvp.general.deaths} \n**K/D Ratio** ${(pvp.general.kills / pvp.general.deaths).toFixed(2)} \n**Playtime:** ${Math.round(pvp.general.playtime / 3600)} hours`)
		.addField('Terrorist Hunt:', `**Wins:** ${pve.general.wins} \n**Losses:** ${pve.general.losses} \n**Win/Loss ratio:** ${(pve.general.wins / pve.general.matches * 100).toFixed(2)} \n**Kills** ${pve.general.kills} \n**Deaths:** ${pve.general.deaths} \n**K/D Ratio** ${(pve.general.kills / pve.general.deaths).toFixed(2)} \n**Playtime:** ${Math.round(pve.general.playtime / 3600)} hours`)
		.setTimestamp()
		.setFooter(message.author.username);
	r.delete();
	message.channel.send(embed).catch(e => message.channel.send(`There was an error: ${e.message}`));
};

module.exports.config = {
	command: 'r6',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'r6',
	category: 'Searcher',
	description: 'Gets statistics on a Rainbow 6 Account',
	usage: '!r6 {user} [pc | xbox | ps4] [eu | na | as]',
};
