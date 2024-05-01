import { EgglordEmbed } from 'src/utils';
import { ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver, Guild, Message } from 'discord.js';
import Command from 'src/structures/Command';
import EgglordClient from 'src/base/Egglord';
import { Setting } from '@prisma/client';

/**
 * Pokemon command
 * @extends {Command}
*/
export default class Pokemon extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
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

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(client: EgglordClient, message: Message, settings: Setting) {
		// Get pokemon
		const pokemon = message.args.join(' ');
		if (!pokemon) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/pokemon:USAGE')) });
		}

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Search for pokemon

		try {
			const embed = await this.fetchPokemonData(client, message.guild, pokemon);
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			// An error occured when looking for account
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @param {args} args The options provided in the command, if any
 	 * @returns {embed}
	*/
	async callback(client:EgglordClient, interaction: CommandInteraction<'cached'>, guild: Guild, args: Omit<CommandInteractionOptionResolver, | 'getMessage' | 'getFocused' | 'getMentionable' | 'getRole' | 'getAttachment' | 'getNumber' | 'getInteger' | 'getString' | 'getChannel' | 'getBoolean' | 'getSubcommandGroup' | 'getSubcommand' >) {
		const channel = guild.channels.cache.get(interaction.channelId),
			pokemon = args.get('pokemon')?.value as string;

		// Search for pokemon
		try {
			const embed = await this.fetchPokemonData(client, guild, pokemon);

			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			// An error occured when looking for account
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	async fetchPokemonData(client: EgglordClient, guild: Guild, name: string) {
		const pokemon = await client.fetch('misc/pokemon', { pokemon: name });
		if (pokemon.error) throw new Error(pokemon.error);

		// Send response to channel
		const embed = new EgglordEmbed(client, guild)
			.setAuthor({ name: pokemon.name, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${pokemon.images.typeIcon}` })
			.setDescription(`Type of this pokemon is **${pokemon.info.type}**. ${pokemon.info.description}`)
			.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${pokemon.images.photo}`)
			.setFooter({ text:`Weakness of pokemon - ${pokemon.info.weakness}`, iconURL:`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${pokemon.images.weaknessIcon}` });

		return embed;
	}
}

