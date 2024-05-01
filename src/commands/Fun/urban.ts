import Command from 'src/structures/Command';
import { EgglordEmbed } from 'src/utils';
import { ApplicationCommandOptionType } from 'discord.js';

/**
 * Urban command
 * @extends {Command}
*/
export default class Urban extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'urban',
			nsfw: true,
			dirname: __dirname,
			description: 'Get the urban dictionary of a word.',
			usage: 'urban <word>',
			cooldown: 1000,
			examples: ['urban watermelon sugar', 'urban nice drip'],
			slash: true,
			options: [{
				name: 'phrase',
				description: 'Phrase to look up.',
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
	async run(client, message, settings) {
		// Get phrase
		const phrase = message.args.join(' ');
		if (!phrase) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/urban:USAGE')) });
		}

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Search up phrase in urban dictionary
		const resp = await this.fetchDefinition(client, message.guild, phrase, message.channel);
		msg.delete();
		message.channel.send({ embeds: [resp] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			phrase = args.get('phrase').value;

		// display phrases' definition
		const resp = await this.fetchDefinition(client, guild, phrase, channel);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for fetching and creating definition embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} phrase The phrase to search
	 * @param {channel} channel The channel the command was ran in
	 * @returns {embed}
	*/
	async fetchDefinition(client, guild, phrase, channel) {
		try {
			const definitions = await client.fetch('info/urban-dictionary', { phrase: phrase });
			if (definitions.error) throw new Error(definitions.error);

			// send definition of word
			return new EgglordEmbed(client, guild)
				.setTitle('fun/urban:TITLE', { WORD: phrase })
				.setURL(definitions[0].permalink)
				.setThumbnail('https://i.imgur.com/VFXr0ID.jpg')
				.setDescription(guild.translate('fun/urban:DESC', { DEFINTION: definitions[0].definition, EXAMPLES: definitions[0].example }))
				.addFields(
					{ name: '👍', value: `${definitions[0].thumbs_up}`, inline: true },
					{ name: '👎', value: `${definitions[0].thumbs_down}`, inline: true },
				);
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('fun/urban:INCORRECT_URBAN', { PHRASE: phrase }, true);
		}
	}
}

