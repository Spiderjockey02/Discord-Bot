// Dependencies
const { MessageEmbed } = require('discord.js'),
	R6API = require('r6api.js'),
	config = require('../../config.js'),
	{ getId, getLevel, getRank, getStats } = new R6API(config.api_keys.rainbow.email, config.api_keys.rainbow.password),
	Command = require('../../structures/Command.js');

module.exports = class R6 extends Command {
	constructor(bot) {
		super(bot, {
			name: 'r6',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets statistics on a Rainbow 6 Account.',
			usage: 'r6 <user> [pc / xbox / ps4] [eu / na / as]',
			cooldown: 3000,
			examples: ['r6 ThatGingerGuy02', 'r6 ThatGingerGuy02 pc eu'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get platforms and regions (just make it easier for users to use this command)
		const platforms = { pc: 'UPLAY', xbox: 'XBL', ps4: 'PSN' };
		const regions = { eu: 'emea', na: 'ncsa', as: 'apac' };
		let player, platform, region;

		// Checks to make sure a username was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.send('Please specify a username to search').then(m => setTimeout(() => { m.delete(); }, 2000)
);
		} else {
			player = message.args[0];
		}

		// Get platform
		platform = platforms['pc'];
		for (let i = 0; i < message.args.length; i++) {
			// Get Console
			if (['pc', 'xbox', 'ps4'].includes(message.args[i].toLowerCase())) {
				// console has been found
				platform = platforms[message.args[i].toLowerCase()];
				message.args.splice(i);
			}
		}

		// Get region
		region = regions['eu'];
		for (let i = 0; i < message.args.length; i++) {
			// get region
			if (['eu', 'na', 'as'].includes(message.args[i].toLowerCase())) {
				region = regions[message.args[i].toLowerCase()];
				message.args.splice(i);
			}
		}

		player = message.args.join(' ');
		if (platform === 'xbl') player = player.replace('_', '');
		try {
			player = await getId(platform, player);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}

		// Makes sure that user actually exist
		if (!player.length) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'SEARCHER/UNKNOWN_USER').then(m => setTimeout(() => { m.delete(); }, 10000));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name} account info...`);

		// get statistics of player
		player = player[0];
		const playerRank = await getRank(platform, player.id);
		const playerStats = await getStats(platform, player.id);
		const playerGame = await getLevel(platform, player.id);

		if (!playerRank.length || !playerStats.length || !playerGame.length) {
			msg.delete();
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', 'Mising player data').then(m => setTimeout(() => { m.delete(); }, 5000));
		}
		const { current, max } = playerRank[0].seasons[Object.keys(playerRank[0].seasons)[0]].regions[ region ];
		const { pvp, pve } = playerStats[0];
		const { level, xp } = playerGame[0];

		platform = Object.keys(platforms).find(key => platforms[key] === platform).toLowerCase();
		region = Object.keys(regions).find(key => regions[key] === region).toLowerCase();

		const embed = new MessageEmbed()
			.setAuthor(player.username, bot.user.displayAvatarURL)
			.setDescription(`Stats for the **${region.toUpperCase()}** region on **${platform.toUpperCase()}**`)
			.setThumbnail(current.image)
			.addField('General:', `**Level:** ${level} (${xp} xp) \n**Rank:** ${current.name} (Max: ${max.name}) \n**MMR:** ${current.mmr}`)
			.addField('Statistics:', `**Wins:** ${pvp.general.wins} \n**Losses:** ${pvp.general.losses} \n**Win/Loss ratio:** ${(pvp.general.wins / pvp.general.matches * 100).toFixed(2)} \n**Kills** ${pvp.general.kills} \n**Deaths:** ${pvp.general.deaths} \n**K/D Ratio** ${(pvp.general.kills / pvp.general.deaths).toFixed(2)} \n**Playtime:** ${Math.round(pvp.general.playtime / 3600)} hours`)
			.addField('Terrorist Hunt:', `**Wins:** ${pve.general.wins} \n**Losses:** ${pve.general.losses} \n**Win/Loss ratio:** ${(pve.general.wins / pve.general.matches * 100).toFixed(2)} \n**Kills** ${pve.general.kills} \n**Deaths:** ${pve.general.deaths} \n**K/D Ratio** ${(pve.general.kills / pve.general.deaths).toFixed(2)} \n**Playtime:** ${Math.round(pve.general.playtime / 3600)} hours`)
			.setTimestamp()
			.setFooter(message.author.username);
		msg.delete();
		message.channel.send(embed);
	}
};
