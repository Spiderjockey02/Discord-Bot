// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

const platforms = { pc: 'uplay', xbox: 'xbl', ps4: 'psn' };
const regions = { eu: 'emea', na: 'ncsa', as: 'apac' };

/**
 * R6 command
 * @extends {Command}
*/
class Rainbow6Siege extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'r6',
			dirname: __dirname,
			description: 'Gets statistics on a Rainbow 6 Account.',
			usage: 'r6 <user> [pc / xbox / ps4] [eu / na / as]',
			cooldown: 3000,
			examples: ['r6 ThatGingerGuy02', 'r6 ThatGingerGuy02 pc eu'],
			slash: true,
			options: [{
				name: 'username',
				description: 'account name',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'platform',
				description: 'Device of user.',
				type: ApplicationCommandOptionType.String,
				choices: [...['pc', 'xbox', 'ps4'].map(i => ({ name: i, value: i }))],
				required: false,
			},
			{
				name: 'region',
				description: 'Region of user.',
				type: ApplicationCommandOptionType.String,
				choices: [...['eu', 'na', 'as'].map(i => ({ name: i, value: i }))],
				required: false,
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
		// Get platforms and regions (just make it easier for users to use this command)
		let player, platform, region;

		// Checks to make sure a username was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/r6:USAGE')) });
		} else {
			player = message.args[0];
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

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
			username = args.get('username').value,
			platform = args.get('platform')?.value,
			region = args.get('region')?.value;

		// Get platform
		let device = platforms['pc'];
		if (['pc', 'xbox', 'ps4'].includes(platform?.toLowerCase())) device = platforms[platform.toLowerCase()];

		// Get region
		let Region = regions['eu'];
		if (['eu', 'na', 'as'].includes(region?.toLowerCase())) Region = regions[region.toLowerCase()];

		// display stats
		const resp = await this.fetchUserData(bot, guild, channel, username, device, Region);
		if (resp.color && resp.color == 15158332) {
			interaction.reply({ embeds: [resp], ephermal: true });
		} else {
			interaction.reply({ embeds: [resp] });
		}
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {string} player The player name to search
	 * @param {string} platform The platform to search the player on
	 * @param {string} region The region the player is from
	 * @returns {embed}
	*/
	async fetchUserData(bot, guild, channel, player, platform, region) {
		// /api/games/r6?username=ThatGingerGuy02&platform=uplay&region=emea
		if (platform === 'xbl') player = player.replace('_', '');
		const playerData = await bot.fetch('games/r6', { username: player, platform: platform, region: region });

		return new Embed(bot, guild)
			.setAuthor({ name: player, iconURL: bot.user.displayAvatarURL() })
			.setDescription(guild.translate('searcher/r6:DESC', { REGION: region.toUpperCase(), PLATFORM: platform.toUpperCase() }))
			.setThumbnail(playerData.profileURL)
			.addFields(
				{ name: guild.translate('searcher/r6:GENERAL'), value: guild.translate('searcher/r6:GEN_DATA', {
					LVL: playerData.level, XP: playerData.xp.toLocaleString(guild.settings.Language), NAME: playerData.rank.current.name, MAX_NAME: playerData.rank.max.name,
					MMR: playerData.rank.current.mmr.toLocaleString(guild.settings.Language) }) },
				{ name: guild.translate('searcher/r6:STATS'), value: guild.translate('searcher/r6:STAT_DATA', {
					WIN: playerData.pvp.wins.toLocaleString(guild.settings.Language), LOSS: playerData.pvp.losses.toLocaleString(guild.settings.Language),
					WL: (playerData.pvp.wins / playerData.pvp.matches).toFixed(2), KILL: playerData.pvp.kills.toLocaleString(guild.settings.Language),
					DEATH: playerData.pvp.deaths.toLocaleString(guild.settings.Language), KD: (playerData.pvp.kills / playerData.pvp.deaths).toFixed(2),
					TIME: Math.round(playerData.pvp.playtime / 3600).toLocaleString(guild.settings.Language),
				}) },
				{ name: guild.translate('searcher/r6:TERRORIST'), value: guild.translate('searcher/r6:STAT_DATA', {
					WIN: playerData.pve.wins.toLocaleString(guild.settings.Language), LOSS: playerData.pve.losses.toLocaleString(guild.settings.Language),
					WL: (playerData.pve.wins / playerData.pve.matches).toFixed(2), KILL: playerData.pve.kills.toLocaleString(guild.settings.Language),
					DEATH: playerData.pve.deaths.toLocaleString(guild.settings.Language), KD: (playerData.pve.kills / playerData.pve.deaths).toFixed(2),
					TIME: Math.round(playerData.pve.playtime / 3600).toLocaleString(guild.settings.Language),
				}) },
			)
			.setTimestamp();
	}
}

module.exports = Rainbow6Siege;
