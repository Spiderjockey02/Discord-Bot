// Dependencies
const weather = require('weather-js');
const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
	if (!args.length) return message.channel.send('Please give the weather location');
	weather.find({ search: args.join(' '), degreeType: 'C' }, function(err, result) {
		try {
			const embed = new Discord.MessageEmbed()
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
			console.log(err);
			return message.channel.send('Unable To Get the data of Given location');
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
	description: 'Look up the weather in a certain area',
	usage: '!weather [topic]',
};
