// Dependencies
const { Embed } = require('../../utils'),
	R6API = require('r6api.js'),
	config = require('../../config.js'),
	{ getId, getLevel, getRank, getStats } = new R6API(config.api_keys.rainbow.email, config.api_keys.rainbow.password),
	Command = require('../../structures/Command.js');

const platforms = { pc: 'UPLAY', xbox: 'XBL', ps4: 'PSN' };
const regions = { eu: 'emea', na: 'ncsa', as: 'apac' };

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
			slash: true,
			options: [{
				name: 'username',
				description: 'account name',
				type: 'STRING',
				required: true,
			},
			{
				name: 'platform',
				description: 'Device of user.',
				type: 'STRING',
				required: false,
			},
			{
				name: 'region',
				description: 'Region of user.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get platforms and regions (just make it easier for users to use this command)
		let player, platform, region;

		// Checks to make sure a username was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/r6:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		} else {
			player = message.args[0];
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

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

		// display stats
		const resp = await this.fetchUserData(bot, message.guild, message.channel, player, platform, region);
		msg.delete();
		if (resp.color && resp.color == 15158332) {
			message.channel.send({ embeds: [resp] }).then(m => m.timedDelete({ timeout:10000 }));
		} else {
			message.channel.send({ embeds: [resp] });
		}
		console.log(resp);
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelID),
			username = args.get('username').value,
			platform = args.get('platform')?.value,
			region = args.get('region')?.value;

		// Get platform
		let device = platforms['pc'];
		if (['pc', 'xbox', 'ps4'].includes(platform)) device = platforms[platform.toLowerCase()];

		// Get region
		let Region = regions['eu'];
		if (['eu', 'na', 'as'].includes(region.toLowerCase())) Region = regions[region.toLowerCase()];

		// display stats
		const resp = await this.fetchUserData(bot, guild, channel, username, device, Region);
		if (resp.color && resp.color == 15158332) {
			bot.send(interaction, { embeds: [resp], ephermal: true });
		} else {
			bot.send(interaction, { embeds: [resp] });
		}
	}

	async fetchUserData(bot, guild, channel, player, platform, region) {
		if (platform === 'xbl') player = player.replace('_', '');
		try {
			player = await getId(platform, player);
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}

		// Makes sure that user actually exist
		if (!player.length) {
			return channel.error('searcher/r6:UNKNOWN_USER', {}, true);
		}

		// get statistics of player
		player = player[0];
		let playerRank, playerStats, playerGame;
		try {
			playerRank = await getRank(platform, player.id);
			playerStats = await getStats(platform, player.id);
			playerGame = await getLevel(platform, player.id);
		} catch (err) {
			bot.logger.error(`Command: 'r6' has error: ${err.message}.`);
			channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}

		if (!playerRank?.length || !playerStats?.length || !playerGame?.length) {
			return channel.error('misc:ERROR_MESSAGE', { ERROR: 'Missing player data' }, true);
		}
		const { current, max } = playerRank[0].seasons[Object.keys(playerRank[0].seasons)[0]].regions[ region ];
		const { pvp, pve } = playerStats[0];
		const { level, xp } = playerGame[0];

		platform = Object.keys(platforms).find(key => platforms[key] === platform).toLowerCase();
		region = Object.keys(regions).find(key => regions[key] === region).toLowerCase();

		const embed = new Embed(bot, guild)
			.setAuthor(player.username, bot.user.displayAvatarURL)
			.setDescription(guild.translate('searcher/r6:DESC', { REGION: region.toUpperCase(), PLATFORM: platform.toUpperCase() }))
			.setThumbnail(current.image)
			.addField(guild.translate('searcher/r6:GENERAL'), guild.translate('searcher/r6:GEN_DATA', { LVL: level, XP: xp.toLocaleString(guild.settings.Language), NAME: current.name, MAX_NAME: max.name, MMR: current.mmr.toLocaleString(guild.settings.Language) }))
			.addField(guild.translate('searcher/r6:STATS'), guild.translate('searcher/r6:STAT_DATA', {
				WIN: pvp.general.wins.toLocaleString(guild.settings.Language), LOSS: pvp.general.losses.toLocaleString(guild.settings.Language), WL: (pvp.general.wins / pvp.general.matches).toFixed(2), KILL: pvp.general.kills.toLocaleString(guild.settings.Language), DEATH: pvp.general.deaths.toLocaleString(guild.settings.Language), KD: (pvp.general.kills / pvp.general.deaths).toFixed(2), TIME: Math.round(pvp.general.playtime / 3600).toLocaleString(guild.settings.Language),
			}))
			.addField(guild.translate('searcher/r6:TERRORIST'), guild.translate('searcher/r6:STAT_DATA', {
				WIN: pve.general.wins.toLocaleString(guild.settings.Language), LOSS: pve.general.losses.toLocaleString(guild.settings.Language), WL: (pve.general.wins / pve.general.matches).toFixed(2), KILL: pve.general.kills.toLocaleString(guild.settings.Language), DEATH: pve.general.deaths.toLocaleString(guild.settings.Language), KD: (pve.general.kills / pve.general.deaths).toFixed(2), TIME: Math.round(pve.general.playtime / 3600).toLocaleString(guild.settings.Language),
			}))
			.setTimestamp();
		return embed;
	}
};
