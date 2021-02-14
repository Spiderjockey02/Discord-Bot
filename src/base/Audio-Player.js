// Dependecies
const { Manager } = require('erela.js');
const Deezer = require('erela.js-deezer');
const Spotify = require('erela.js-spotify');
const { MessageEmbed } = require('discord.js');
require('./Music/BetterPlayer');

module.exports = async (bot) => {
	const clientID = bot.config.api_keys.spotify.iD;
	const clientSecret = bot.config.api_keys.spotify.secret;
	bot.manager = new Manager({
		nodes: [
			{ host: 'localhost', port: 2333, password: 'youshallnotpass' },
		],
		plugins: [
			// Allow spotify songs/playlists to be played
			new Spotify({ clientID, clientSecret }),
			new Deezer({ playlistLimit: 1, albumLimit:1 }),
		],
		autoPlay: true,
		send(id, payload) {
			const guild = bot.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	})
		.on('nodeConnect', node => bot.logger.ready(`Node ${node.options.identifier} has connected.`))
		.on('nodeError', (node, error) => bot.logger.error(`Node: '${node.options.identifier}', has error: '${error.message}'.`))
		.on('trackStart', (player, track) => {
			// When a song starts
			const embed = new MessageEmbed()
				.setTitle('» Now playing:')
				.setDescription(`[${track.title}](${track.uri}) [${bot.guilds.cache.get(player.guild).member(track.requester)}]`);
			bot.channels.cache.get(player.textChannel).send(embed).then(m => m.delete({ timeout: track.duration }));
		})
		.on('queueEnd', (player) => {
			// When the queue has finished
			const embed = new MessageEmbed()
				.setDescription('Queue has ended.');
			bot.channels.cache.get(player.textChannel).send(embed);
			player.destroy();
		})
		.on('playerMove', (player, currentChannel, newChannel) => {
			player.voiceChannel = bot.channels.cache.get(newChannel);
		});

	// update voice states
	bot.on('raw', d => bot.manager.updateVoiceState(d));
};
