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
			slash: true,
			options: [{
				name: 'location',
				description: 'The location to gather the weather of.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/weather:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: `${this.help.name}` }));

		// Display weather
		const res = await this.weatherResponse(bot, message.guild, message.args.join(' '));
		console.log(res);
		msg.delete();
		message.channel.send({ embeds: [res] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		// Get weather data
		const location = args.get('location').value;
		const res = await this.weatherResponse(bot, guild, location);

		// Display weather
		return bot.send(interaction, [res]);
	}

	// create weather embed
	async weatherResponse(bot, guild, location) {
		const t = await find({ search: location, degreeType: 'C' }, (err, result) => {
			// make sure location was valid
			if (!result[0]) return 'Invalid location';

			// Display weather at location
			const embed = new Embed(bot, guild)
				.setTitle(bot.translate('searcher/weather:TITLE', { LOC: result[0].location.name }))
				.setDescription(bot.translate('searcher/weather:DESC'))
				.addField(bot.translate('searcher/weather:TEMP'), `${result[0].current.temperature}°C`, true)
				.addField(bot.translate('searcher/weather:SKY'), result[0].current.skytext, true)
				.addField(bot.translate('searcher/weather:HUMIDITY'), `${result[0].current.humidity}%`, true)
				.addField(bot.translate('searcher/weather:SPEED'), result[0].current.windspeed, true)
				.addField(bot.translate('searcher/weather:TIME'), result[0].current.observationtime, true)
				.addField(bot.translate('searcher/weather:DISPLAY'), result[0].current.winddisplay, true)
				.setThumbnail(result[0].current.imageUrl);
			return embed;
		});

		console.log(t);
	}
};
