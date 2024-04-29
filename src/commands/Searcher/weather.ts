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
		const embed = await this.fetchWeatherData(bot, message.channel, message.args[0]);
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
		const channel = guild.channels.cache.get(interaction.channelId),
			location = args.get('location').value;

		// Display weather
		const embed = await this.fetchWeatherData(bot, channel, location);
		interaction.reply({ embeds: [embed] });
	}

	async fetchWeatherData(bot, channel, location) {
		const weather = await bot.fetch('info/weather', { location: location });
		if (weather.error) return channel.error('misc:ERROR_MESSAGE', { ERROR: weather.error }, true);

		// Display weather at location
		const embed = new Embed(bot, channel.guild)
			.setTitle(channel.guild.translate('searcher/weather:TITLE', { LOC: `${weather.location.name}, ${weather.location.country}` }))
			.setDescription(channel.guild.translate('searcher/weather:DESC'))
			.addFields(
				{ name: channel.guild.translate('searcher/weather:TEMP'), value: `${weather.current.temp_c}°C`, inline: true },
				{ name: channel.guild.translate('searcher/weather:SKY'), value: weather.current.condition.text, inline: true },
				{ name: channel.guild.translate('searcher/weather:HUMIDITY'), value: `${weather.current.humidity}%`, inline: true },
				{ name: channel.guild.translate('searcher/weather:SPEED'), value: `${weather.current.wind_mph}mph`, inline: true },
				{ name: channel.guild.translate('searcher/weather:TIME'), value: new Date(weather.current.last_updated).toUTCString(), inline: true },
				{ name: channel.guild.translate('searcher/weather:DISPLAY'), value: weather.current.wind_dir, inline: true },
			);

		return embed;
	}
}

module.exports = Weather;
