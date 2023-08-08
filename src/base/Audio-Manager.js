const { Manager } = require('erela.js'),
	Deezer = require('erela.js-deezer'),
	Spotify = require('erela.js-spotify'),
	Facebook = require('erela.js-facebook'),
	{ LavalinkNodes: nodes, api_keys: { spotify } } = require('../config');
require('../structures/Player');

const plugins = [
	new Deezer({ playlistLimit: 1, albumLimit: 1 }),
	new Facebook(),
];

if (spotify.iD.length > 1 && spotify.secret.length > 1) plugins.push(new Spotify({ clientID: spotify.iD, clientSecret: spotify.secret }));

/**
 * Audio manager
 * @extends {Manager}
*/
class AudioManager extends Manager {
	constructor(bot) {
		super({
			nodes: nodes,
			plugins: plugins,
			autoPlay: true,
			send(id, payload) {
				const guild = bot.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			},
		});
	}
}


module.exports = AudioManager;
