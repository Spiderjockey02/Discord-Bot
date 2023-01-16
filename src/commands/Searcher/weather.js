// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Weather command
 * @extends {Command}
*/
class Weather extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'weather',
			dirname: __dirname,
			description: 'Look up the weather in a certain area.',
			usage: 'weather <location>',
			cooldown: 3000,
			examples: ['weather england', 'weather new york'],
			slash: true,
			options: [{
				name: 'location',
				description: 'The location to gather the weather of.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/weather:USAGE')) });

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: `${this.help.name}` }));

		// Display weather
		const embed = await this.fetchWeatherData(bot, message.guild, message.args[0]);
		msg.delete();
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const location = args.get('location').value;

		// Display weather
		const embed = await this.fetchWeatherData(bot, guild, location);
		interaction.reply({ embeds: [embed] });
	}

	async fetchWeatherData(bot, guild, location) {
		const weather = await bot.fetch('info/weather', { location: location });

		// Display weather at location
		const embed = new Embed(bot, guild)
			.setTitle(guild.translate('searcher/weather:TITLE', { LOC: weather.location }))
			.setDescription(guild.translate('searcher/weather:DESC'))
			.addFields(
				{ name: guild.translate('searcher/weather:TEMP'), value: `${weather.current.temperature}°C`, inline: true },
				{ name: guild.translate('searcher/weather:SKY'), value: weather.current.skytext, inline: true },
				{ name: guild.translate('searcher/weather:HUMIDITY'), value: `${weather.current.humidity}%`, inline: true },
				{ name: guild.translate('searcher/weather:SPEED'), value: weather.current.windspeed, inline: true },
				{ name: guild.translate('searcher/weather:TIME'), value: weather.current.observationtime, inline: true },
				{ name: guild.translate('searcher/weather:DISPLAY'), value: weather.current.winddisplay, inline: true },
			);

		return embed;
	}
}

module.exports = Weather;
