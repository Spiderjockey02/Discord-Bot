// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Addban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'addban',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add a ban to the global ban list.',
			usage: 'addban <user> <reason>',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// something will happen
		return settings;
	}
};
