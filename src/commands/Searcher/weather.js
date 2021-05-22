// Dependencies
const { find } = require('weather-js'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Weather extends Command {
	constructor(bot) {
		super(bot, {
			name: 'weather',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Look up the weather in a certain area.',
			usage: 'weather <location>',
			cooldown: 3000,
			examples: ['weather england', 'weather new york'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/weather:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: `${this.help.name}` }));

		// search up weather stats
		find({ search: message.args.join(' '), degreeType: 'C' }, function(err, result) {
			// make sure location was valid
			if (!result[0]) return message.channel.send('Invalid location');

			// Display weather at location
			try {
				const embed = new Embed(bot, message.guild)
					.setTitle(message.translate('searcher/weather:TITLE', { LOC: result[0].location.name }))
					.setDescription(message.translate('searcher/weather:DESC'))
					.addField(message.translate('searcher/weather:TEMP'), `${result[0].current.temperature}°C`, true)
					.addField(message.translate('searcher/weather:SKY'), result[0].current.skytext, true)
					.addField(message.translate('searcher/weather:HUMIDITY'), `${result[0].current.humidity}%`, true)
					.addField(message.translate('searcher/weather:SPEED'), result[0].current.windspeed, true)
					.addField(message.translate('searcher/weather:TIME'), result[0].current.observationtime, true)
					.addField(message.translate('searcher/weather:DISPLAY'), result[0].current.winddisplay, true)
					.setThumbnail(result[0].current.imageUrl);
				msg.delete();
				message.channel.send(embed);
			} catch(err) {
				if (message.deletable) message.delete();
				msg.delete();
				bot.logger.error(`Command: 'weather' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		});
	}
};
