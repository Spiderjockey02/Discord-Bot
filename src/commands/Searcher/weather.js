// Dependencies
const { find } = require('weather-js');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	if (!args.length) return message.channel.send('Please give the weather location');
	find({ search: args.join(' '), degreeType: 'C' }, function(err, result) {
		try {
			const embed = new MessageEmbed()
				.setTitle(`Weather - ${result[0].location.name}`)
				.setDescription('Temperature units can may be differ some time')
				.addField('Temperature', `${result[0].current.temperature}°C`, true)
				.addField('Sky Text', result[0].current.skytext, true)
				.addField('Humidity', `${result[0].current.humidity}%`, true)
				.addField('Wind Speed', result[0].current.windspeed, true)
				.addField('Observation Time', result[0].current.observationtime, true)
				.addField('Wind Display', result[0].current.winddisplay, true)
				.setThumbnail(result[0].current.imageUrl);
			message.channel.send(embed);
		} catch(err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: weather.`);
			return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
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
