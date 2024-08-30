import { fetchFromAPI } from '../../utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Pokemon command
 * @extends {Command}
*/
export default class Pokemon extends Command {
	constructor() {
		super({
			name: 'pokemon',
			dirname: __dirname,
			description: 'Get information on a pokemon.',
			usage: 'pokemon <pokemon>',
			cooldown: 1000,
			examples: ['pokemon charizard', 'pokemon pikachu'],
			slash: true,
			options: [{
				name: 'pokemon',
				description: 'The specified pokemon to gather information on.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		// TODO - update to something like message.getArgs('pokemon')
		const pokemon = message.getArgs()[0];

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send({ content:
      client.languageManager.translate(message.guild, 'misc:FETCHING', { EMOJI: client.customEmojis['loading'], ITEM: this.help.name }),
		});

		try {
			const embed = await this.fetchPokemonData(client, message.guild, pokemon);
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err: any) {
			// An error occured when looking for account
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err}.`);
			msg.delete();

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			return message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>, guild: Guild) {
		const pokemon = interaction.options.getString('pokemon', true);

		// Search for pokemon
		try {
			const embed = await this.fetchPokemonData(client, guild, pokemon);
			return interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err}.`);
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });

			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	async fetchPokemonData(bot: EgglordClient, guild: Guild | null, name: string) {
		const pokemon = await fetchFromAPI('misc/pokemon', { pokemon: name });
		if (pokemon.error) throw new Error(pokemon.error);

		// Send response to channel
		const embed = new EgglordEmbed(bot, guild)
			.setAuthor({ name: pokemon.name, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${pokemon.images.typeIcon}` })
			.setDescription(`Type of this pokemon is **${pokemon.info.type}**. ${pokemon.info.description}`)
			.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${pokemon.images.photo}`)
			.setFooter({ text:`Weakness of pokemon - ${pokemon.info.weakness}`, iconURL:`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${pokemon.images.weaknessIcon}` });

		return embed;
	}
}