// Dependencies
const { find } = require('weather-js');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('weather').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	// search up weather stats
	find({ search: args.join(' '), degreeType: 'C' }, function(err, result) {
		try {
			const embed = new MessageEmbed()
				.setTitle(message.translate(settings.Language, 'SEARCHER/WEATHER_TITLE', result[0].location.name))
				.setDescription(message.translate(settings.Language, 'SEARCHER/WEATHER_DESCRIPTION'))
				.addField(message.translate(settings.Language, 'SEARCHER/WEATHER_TEMP'), `${result[0].current.temperature}°C`, true)
				.addField(message.translate(settings.Language, 'SEARCHER/WEATHER_SKY'), result[0].current.skytext, true)
				.addField(message.translate(settings.Language, 'SEARCHER/WEATHER_HUMIDITY'), `${result[0].current.humidity}%`, true)
				.addField(message.translate(settings.Language, 'SEARCHER/WEATHER_SPEED'), result[0].current.windspeed, true)
				.addField(message.translate(settings.Language, 'SEARCHER/WEATHER_TIME'), result[0].current.observationtime, true)
				.addField(message.translate(settings.Language, 'SEARCHER/WEATHER_DISPLAY'), result[0].current.winddisplay, true)
				.setThumbnail(result[0].current.imageUrl);
			message.channel.send(embed);
		} catch(err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: weather.`);
			return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	});
};

module.exports.config = {
	command: 'weather',
	aliases: ['img'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'weather',
	category: 'Searcher',
	description: 'Look up the weather in a certain area.',
	usage: '${PREFIX}weather <location>',
};
