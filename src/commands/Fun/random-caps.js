// Dependencies
const	Command = require('../../structures/Command.js');

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
			name: 'random-caps',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Generate a random caps',
			usage: 'random-caps <string>',
			cooldown: 1000,
			slash: true,
			options: [{
				name: 'text',
				description: 'Text for random caps',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		const text = message.args.join(' ');
		const rndCaps = text.toLowerCase().split('').map(c => Math.random() < 0.5 ? c : c.toUpperCase()).join('');
		message.channel.send(rndCaps);
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const text = args.get('text').value;
		const rndCaps = text.toLowerCase().split('').map(c => Math.random() < 0.5 ? c : c.toUpperCase()).join('');

		// send result
		return interaction.reply({ content: `${rndCaps}` });
	}
}

module.exports = RandomCaps;
