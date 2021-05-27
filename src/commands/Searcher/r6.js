// Dependencies
const { Embed } = require('../../utils'),
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
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/r6:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
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
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}

		// Makes sure that user actually exist
		if (!player.length) {
			if (message.deletable) message.delete();
			return message.channel.error('searcher/r6:UNKNOWN_USER').then(m => m.delete({ timeout: 10000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// get statistics of player
		player = player[0];
		const playerRank = await getRank(platform, player.id);
		const playerStats = await getStats(platform, player.id);
		const playerGame = await getLevel(platform, player.id);

		if (!playerRank.length || !playerStats.length || !playerGame.length) {
			msg.delete();
			if (message.deletable) message.delete();
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Mising player data' }).then(m => m.delete({ timeout: 5000 }));
		}
		const { current, max } = playerRank[0].seasons[Object.keys(playerRank[0].seasons)[0]].regions[ region ];
		const { pvp, pve } = playerStats[0];
		const { level, xp } = playerGame[0];

		platform = Object.keys(platforms).find(key => platforms[key] === platform).toLowerCase();
		region = Object.keys(regions).find(key => regions[key] === region).toLowerCase();

		const embed = new Embed(bot, message.guild)
			.setAuthor(player.username, bot.user.displayAvatarURL)
			.setDescription(message.translate('searcher/r6:DESC', { REGION: region.toUpperCase(), PLATFORM: platform.toUpperCase() }))
			.setThumbnail(current.image)
			.addField(message.translate('searcher/r6:GENERAL'), message.translate('searcher/r6:GEN_DATA', { LVL: level, XP: xp.toLocaleString(settings.Language), NAME: current.name, MAX_NAME: max.name, MMR: current.mmr.toLocaleString(settings.Language) }))
			.addField(message.translate('searcher/r6:STATS'), message.translate('searcher/r6:STAT_DATA', {
				WIN: pvp.general.wins.toLocaleString(settings.Language), LOSS: pvp.general.losses.toLocaleString(settings.Language), WL: (pvp.general.wins / pvp.general.matches).toFixed(2), KILL: pvp.general.kills.toLocaleString(settings.Language), DEATH: pvp.general.deaths.toLocaleString(settings.Language), KD: (pvp.general.kills / pvp.general.deaths).toFixed(2), TIME: Math.round(pvp.general.playtime / 3600).toLocaleString(settings.Language),
			}))
			.addField(message.translate('searcher/r6:TERRORIST'), message.translate('searcher/r6:STAT_DATA', {
				WIN: pve.general.wins.toLocaleString(settings.Language), LOSS: pve.general.losses.toLocaleString(settings.Language), WL: (pve.general.wins / pve.general.matches).toFixed(2), KILL: pve.general.kills.toLocaleString(settings.Language), DEATH: pve.general.deaths.toLocaleString(settings.Language), KD: (pve.general.kills / pve.general.deaths).toFixed(2), TIME: Math.round(pve.general.playtime / 3600).toLocaleString(settings.Language),
			}))
			.setTimestamp()
			.setFooter(message.author.username);
		msg.delete();
		message.channel.send(embed);
	}
};
