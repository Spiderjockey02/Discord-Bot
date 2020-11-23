// Dependecies
const { Manager } = require('erela.js');
const { Spotify } = require('./Music/SpotifyHandler');
const { MessageEmbed } = require('discord.js');

module.exports = async (bot) => {
	const clientID = bot.config.api_keys.spotify.iD;
	const clientSecret = bot.config.api_keys.spotify.secret;
	bot.manager = new Manager({
		nodes: [
			{ host: 'localhost', port: 2333, password: 'youshallnotpass' },
		],
		plugins: [
			// Initiate the plugin and pass the two required options.
			new Spotify({ clientID, clientSecret }),
		],
		autoPlay: true,
		send(id, payload) {
			const guild = bot.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	})
		.on('nodeConnect', node => console.log(`Node ${node.options.identifier} connected`))
		.on('nodeError', (node, error) => console.log(`Node ${node.options.identifier} had an error: ${error.message}`))
		.on('trackStart', (player, track) => {
			// When a song starts
			const embed = new MessageEmbed()
				.setTitle('Now playing:')
				.setDescription(`[${track.title}](${track.uri}) [${bot.guilds.cache.get(player.guild).member(track.requester)}]`);
			bot.channels.cache.get(player.textChannel).send(embed).then(m => m.delete({ timeout: track.duration }));
		})
		.on('queueEnd', (player) => {
			// When the queue has finished
			bot.channels.cache.get(player.textChannel).send('Queue has ended.');
			player.destroy();
		});

	// update voice states
	bot.on('raw', d => bot.manager.updateVoiceState(d));
};
