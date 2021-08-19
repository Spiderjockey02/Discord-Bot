// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * CustomCommand command
 * @extends {Command}
*/
module.exports = class CustomCommand extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		// MORE COMMAND SETTINGS CAN BE FOUND IN src/structures/Command
		super(bot, {
			name: 'NAME OF THE COMMAND - THIS MUST MATCH THE FILE NAME',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['AN', 'ARRAY', 'OF', 'ALTERNATIVE', 'COMMANDS'],
			botPermissions: ['AN', 'ARRAY', 'OF', 'PERMISSIONS', 'THE', 'BOT', 'NEED', 'RUN', 'THIS'],
			description: 'Displays user\'s avatar.',
			usage: 'HOW SHOULD THE USER USE THIS COMMAND (excluding prefix)',
			cooldown: 2000,
			examples: ['AN', 'ARRAY', 'OF', 'EXAMPLES'],
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
		// A VERY COOL COMMAND
		console.log(settings);
	}
};
