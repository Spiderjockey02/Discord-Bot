// Dependencies
const { find } = require('weather-js'),
	{ Embed } = require('../../utils'),
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

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/weather:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: `${this.help.name}` }));

		// Display weather
		await find({ search: message.args.join(' '), degreeType: 'C' }, (err, result) => {
			// make sure location was valid
			if (!result[0]) return message.channel.error('search/weather:INVALID').then(m => m.timedDelete({ timeout:5000 }));

			// Display weather at location
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
			message.channel.send({ embeds: [embed] });
		});
	}

	/**
 	 * Function for recieving interaction.
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
		await find({ search: location, degreeType: 'C' }, (err, result) => {
			// make sure location was valid
			if (!result[0]) return channel.error('search/weather:INVALID').then(m => m.timedDelete({ timeout:5000 }));

			// Display weather at location
			const embed = new Embed(bot, guild)
				.setTitle(guild.translate('searcher/weather:TITLE', { LOC: result[0].location.name }))
				.setDescription(guild.translate('searcher/weather:DESC'))
				.addField(guild.translate('searcher/weather:TEMP'), `${result[0].current.temperature}°C`, true)
				.addField(guild.translate('searcher/weather:SKY'), result[0].current.skytext, true)
				.addField(guild.translate('searcher/weather:HUMIDITY'), `${result[0].current.humidity}%`, true)
				.addField(guild.translate('searcher/weather:SPEED'), result[0].current.windspeed, true)
				.addField(guild.translate('searcher/weather:TIME'), result[0].current.observationtime, true)
				.addField(guild.translate('searcher/weather:DISPLAY'), result[0].current.winddisplay, true)
				.setThumbnail(result[0].current.imageUrl);
			interaction.reply({ embeds: [embed] });
		});
	}
}

module.exports = Weather;
