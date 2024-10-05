import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * Weather command
 * @extends {Command}
*/
export default class Weather extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
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
				autocomplete: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// Display weather
		const embed = await this.fetchWeatherData(client, message.guild, message.args[0]);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const location = interaction.options.getString('location', true);

		// Display weather
		const embed = await this.fetchWeatherData(client, interaction.guild, location);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for handling autocomplete
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async autocomplete(_client: EgglordClient, interaction: AutocompleteInteraction) {
		const input = interaction.options.getFocused(true).value;
		if (input.length == 0) return;

		// Fetch from the API and return the results
		const data = await fetchFromAPI('info/place', { location: input });
		interaction.respond(data.map((i: any) => ({ name: i.name, value: i.name })));
	}

	async fetchWeatherData(client: EgglordClient, guild: Guild | null, location: string) {
		try {
			const weather = await fetchFromAPI('info/weather', { location: location });
			if (weather.error) throw new Error(weather.error);

			// Display weather at location
			const embed = new EgglordEmbed(client, guild)
				.setTitle(client.languageManager.translate(guild, 'searcher/weather:TITLE', { LOC: `${weather.location.name}, ${weather.location.country}` }))
				.setDescription(client.languageManager.translate(guild, 'searcher/weather:DESC'))
				.addFields(
					{ name: client.languageManager.translate(guild, 'searcher/weather:TEMP'), value: `${weather.current.temp_c}°C`, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/weather:SKY'), value: weather.current.condition.text, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/weather:HUMIDITY'), value: `${weather.current.humidity}%`, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/weather:SPEED'), value: `${weather.current.wind_mph}mph`, inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/weather:TIME'), value: new Date(weather.current.last_updated).toUTCString(), inline: true },
					{ name: client.languageManager.translate(guild, 'searcher/weather:DISPLAY'), value: weather.current.wind_dir, inline: true },
				);

			return embed;
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}

