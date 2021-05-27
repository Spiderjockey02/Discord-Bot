const { Manager } = require('erela.js'),
	Deezer = require('erela.js-deezer'),
	Spotify = require('erela.js-spotify'),
	Facebook = require('erela.js-facebook'),
	{ MessageEmbed } = require('discord.js'),
	{ Embed } = require('../utils');
require('../structures/Player');

module.exports = async (bot) => {
	const clientID = bot.config.api_keys.spotify.iD;
	const clientSecret = bot.config.api_keys.spotify.secret;

	bot.manager = new Manager({
		nodes: [
			{ host: 'localhost', port: 5000, password: 'youshallnotpass' },
		],
		plugins: [
			new Spotify({ clientID, clientSecret }),
			new Deezer({ playlistLimit: 1, albumLimit:1 }),
			new Facebook(),
		],
		autoPlay: true,
		send(id, payload) {
			const guild = bot.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	})
		.on('nodeConnect', node => bot.logger.ready(`Lavalink node: ${node.options.identifier} has connected.`))
		.on('nodeDisconnect', (node, reason) => bot.logger.error(`Lavalink node: ${node.options.identifier} has disconnect, reason: ${(reason.reason) ? reason.reason : 'unspecified'}.`))
		.on('nodeError', (node, error) => bot.logger.error(`Lavalink node: '${node.options.identifier}', has error: '${error.message}'.`))
		.on('playerCreate', player => {
			if (bot.config.debug) bot.logger.log(`Lavalink player created in guild: ${player.guild}.`);
		})
		.on('playerDestroy', player => {
			if (bot.config.debug) bot.logger.log(`Lavalink player destroyed in guild: ${player.guild}.`);
		})
		.on('trackStart', (player, track) => {
			// When a song starts
			const embed = new Embed(bot, bot.guilds.cache.get(player.guild))
				.setColor(bot.guilds.cache.get(player.guild).members.cache.get(track.requester.id).displayHexColor)
				.setTitle('music/np:AUTHOR')
				.setDescription(`[${track.title}](${track.uri}) [${bot.guilds.cache.get(player.guild).member(track.requester)}]`);
			const channel = bot.channels.cache.get(player.textChannel);
			if (channel) channel.send(embed).then(m => m.delete({ timeout: (track.duration < 6.048e+8) ? track.duration : 60000 }));

			// clear timeout (for queueEnd event)
			if (player.timeout != null) return clearTimeout(player.timeout);
		})
		.on('trackEnd', (player, track) => {
			// when track finishes add to previous songs array
			player.addPreviousSong(track);
		})
		.on('trackError', (player, track, payload) => {
			// when a track causes an error
			if (bot.config.debug) bot.logger.log(`Track error: ${payload.error} in guild: ${player.guild}.`);

			// reset player filter (might be the cause)
			player.resetFilter();

			// send embed
			const embed = new MessageEmbed()
				.setColor(15158332)
				.setDescription(`An error has occured on playback: \`${payload.error}\``);
			const channel = bot.channels.cache.get(player.textChannel);
			if (channel) channel.send(embed).then(m => m.delete({ timeout: 15000 }));
		})
		.on('queueEnd', (player) => {
			// When the queue has finished
			player.timeout = setTimeout(() => {
				// Don't leave channel if 24/7 mode is active
				if (player.twentyFourSeven) return;

				const vcName = bot.channels.cache.get(player.voiceChannel) ? bot.channels.cache.get(player.voiceChannel).name : 'unknown';
				const embed = new MessageEmbed()
					.setDescription(bot.translate('music/dc:INACTIVE', { VC: vcName }, bot.guilds.cache.get(player.guild).settings.Language));
				const channel = bot.channels.cache.get(player.textChannel);
				if (channel) channel.send(embed);
				player.destroy();
			}, 180000);
		})
		.on('playerMove', (player, currentChannel, newChannel) => {
			// Voice channel updated
			if (!newChannel) {
				const embed = new MessageEmbed()
					.setDescription(bot.translate('music/dc:KICKED', {}, bot.guilds.cache.get(player.guild).settings.Language));
				const channel = bot.channels.cache.get(player.textChannel);
				if (channel) channel.send(embed);
				player.destroy();
			} else {
				player.voiceChannel = bot.channels.cache.get(newChannel);
			}
		});
};
