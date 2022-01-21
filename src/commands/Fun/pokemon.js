// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

/**
 * Pokemon command
 * @extends {Command}
*/
class Pokemon extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'pokemon',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a pokemon.',
			usage: 'pokemon <pokemon>',
			cooldown: 1000,
			examples: ['pokemon charizard', 'pokemon pikachu'],
			slash: true,
			options: [{
				name: 'pokemon',
				description: 'The specified pokemon to gather information on.',
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
		// Get pokemon
		const pokemon = message.args.join(' ');
		if (!pokemon) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/pokemon:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Search for pokemon

		try {
			const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`).then(info => info.json());

			// Send response to channel
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: res.name, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.typeIcon}` })
				.setDescription(`Type of this pokemon is **${res.info.type}**. ${res.info.description}`)
				.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.photo}`)
				.setFooter({ text: `Weakness of pokemon - ${res.info.weakness}`, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.weaknessIcon}` });
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			// An error occured when looking for account
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @param {args} args The options provided in the command, if any
 	 * @returns {embed}
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			pokemon = args.get('pokemon').value;

		// Search for pokemon
		try {
			const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`).then(info => info.json());

			// Send response to channel
			const embed = new Embed(bot, guild)
				.setAuthor({ name: res.name, iconURL: `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.typeIcon}` })
				.setDescription(`Type of this pokemon is **${res.info.type}**. ${res.info.description}`)
				.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.photo}`)
				.setFooter({ text:`Weakness of pokemon - ${res.info.weakness}`, iconURL:`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.weaknessIcon}` });
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			// An error occured when looking for account
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Pokemon;
