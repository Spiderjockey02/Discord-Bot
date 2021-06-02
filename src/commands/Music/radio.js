// Dependencies
const { Embed } = require('../../utils'),
	{ getStations } = require('radio-browser'),
	Command = require('../../structures/Command.js');

module.exports = class Radio extends Command {
	constructor(bot) {
		super(bot, {
			name: 'radio',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Listen to the radio',
			usage: 'radio',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// make sure a radio station was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/radio:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Search for radio station
		getStations({
			limit: 5,
			by: 'tag',
			searchterm: message.args.join(' '),
		})
			.then(async data => {
				if (!data[0]) return message.channel.send('No radio found with that name');

				const results = data.map((track, index) => `${++index} - \`${track.name}\``).join('\n');
				const embed = new Embed(bot, message.guild)
					.setTitle(`Results for ${message.args.join(' ')}`)
					.setColor(message.member.displayHexColor)
					.setDescription(`${results}\n\n\tPick a number from 1-10 or cancel.\n`);
				message.channel.send(embed);

				const filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
				const max = data.length;

				let collected;
				try {
					collected = await message.channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ['time'] });
				} catch (e) {
					return message.reply('You didn\'t choose a song in time.');
				}

				const first = collected.first().content;

				if (first.toLowerCase() === 'cancel') {
					if (!player.queue.current) player.destroy();
					return message.channel.send('Cancelled selection.');
				}

				const index = Number(first) - 1;
				if (index < 0 || index > max - 1) return message.reply(`The number you provided was too small or too big (1-${max}).`);

				let player;
				try {
					player = bot.manager.create({
						guild: message.guild.id,
						voiceChannel: message.member.voice.channel.id,
						textChannel: message.channel.id,
						selfDeafen: true,
					});
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				}

				const res = await player.search(data[index].url, message.author);

				if (res.loadType == 'NO_MATCHES') {
					// An error occured or couldn't find the track
					if (!player.queue.current) player.destroy();
					return message.channel.error('music/play:NO_SONG');
				} else {
					// add track to queue and play
					if (player.state !== 'CONNECTED') player.connect();
					player.queue.add(res.tracks[0]);
					if (!player.playing && !player.paused && !player.queue.size) {
						player.play();
					} else {
						message.channel.send({ embed: { color: message.member.displayHexColor, description:`Added to queue: [${res.tracks[0].title}](${res.tracks[0].uri})` } });
					}
				}
			});
	}
};
