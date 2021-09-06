const { Manager } = require('erela.js'),
	Deezer = require('erela.js-deezer'),
	Spotify = require('erela.js-spotify'),
	Facebook = require('erela.js-facebook');
require('../structures/Player');

/**
 * Audio manager
 * @extends {Manager}
*/
class AudioManager extends Manager {
	constructor(bot) {
		super({
			nodes: [
				{ host: 'localhost', port: 5000, password: 'youshallnotpass' },
			],
			plugins: [
				new Deezer({ playlistLimit: 1, albumLimit: 1 }),
				new Facebook(),
				new Spotify({ clientID: bot['config']['api_keys']['spotify']['iD'], clientSecret: bot['config']['api_keys']['spotify']['secret'] }),
			],
			autoPlay: true,
			send(id, payload) {
				const guild = bot.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			},
		});
	}
}


module.exports = AudioManager;
