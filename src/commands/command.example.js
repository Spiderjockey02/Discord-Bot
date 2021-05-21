// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Avatar extends Command {
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

	// Run command
	async run(bot, message, settings) {
	   // A VERY COOL COMMAND
	}
};
