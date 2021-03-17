const { Manager } = require('erela.js'),
	Deezer = require('erela.js-deezer'),
	Spotify = require('erela.js-spotify'),
	Facebook = require('erela.js-facebook'),
	{ MessageEmbed } = require('discord.js');
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
		.on('playerCreate', player => bot.logger.log(`Lavalink player created in guild: [${player.guild}].`))
		.on('playerDestroy', player => bot.logger.log(`Lavalink player destroyed in guild: [${player.guild}].`))
		.on('trackStart', (player, track) => {
			// When a song starts
			const embed = new MessageEmbed()
				.setColor(bot.guilds.cache.get(player.guild).member(track.requester).displayHexColor)
				.setTitle('» Now playing:')
				.setDescription(`[${track.title}](${track.uri}) [${bot.guilds.cache.get(player.guild).member(track.requester)}]`);
			const channel = bot.channels.cache.get(player.textChannel);
			if (channel) channel.send(embed).then(m => m.delete({ timeout: (track.duration < 6.048e+8) ? track.duration : 60000 }));
		})
		.on('trackError', (player, track, payload) => {
			// when a track causes an error
			const embed = new MessageEmbed()
				.setColor(15158332)
				.setDescription(`An error has occured on playback: \`${payload.error}\``);
			const channel = bot.channels.cache.get(player.textChannel);
			if (channel) channel.send(embed).then(m => m.delete({ timeout: 15000 }));
		})
		.on('queueEnd', (player) => {
			// When the queue has finished
			const embed = new MessageEmbed()
				.setDescription('Queue has ended.');
			const channel = bot.channels.cache.get(player.textChannel);
			if (channel) channel.send(embed);
		})
		.on('playerMove', (player, currentChannel, newChannel) => {
			// Voice channel updated
			if (!newChannel) {
				const channel = bot.channels.cache.get(player.textChannel);
				if (channel) channel.send('The queue has ended as I was kicked from the voice channel');
				player.destroy();
			} else {
				player.voiceChannel = bot.channels.cache.get(newChannel);
			}
		});

	// update voice states
	bot.on('raw', d => bot.manager.updateVoiceState(d));
};
