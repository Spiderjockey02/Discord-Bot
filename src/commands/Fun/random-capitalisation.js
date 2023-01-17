// Dependencies
const	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Flip command
 * @extends {Command}
*/
class RandomCaps extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'random-capitalisation',
			dirname: __dirname,
			description: 'Generate a random caps',
			usage: 'random-capitalisation <string>',
			cooldown: 1000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'text',
				description: 'Text for random caps',
				type: ApplicationCommandOptionType.String,
				maxLength: 2000,
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		const text = message.args.join(' '),
			rndCaps = text.toLowerCase().split('').map(c => Math.random() < 0.5 ? c : c.toUpperCase()).join('');
		message.channel.send({ content: rndCaps });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const text = args.get('text').value,
			rndCaps = text.toLowerCase().split('').map(c => Math.random() < 0.5 ? c : c.toUpperCase()).join('');

		// send result
		return interaction.reply({ content: rndCaps });
	}
}

module.exports = RandomCaps;
