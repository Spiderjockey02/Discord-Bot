// Dependencies
const { Node } = require('erela.js'),
	Command = require('../../structures/Command.js');

module.exports = class MusicNode extends Command {
	constructor(bot) {
		super(bot, {
			name: 'node',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add/remove a Node for lavalink.',
			usage: 'node <add | remove> [host] [password] [port]',
			cooldown: 3000,
			examples: ['node add localhost youshallnotpass 5000'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// delete message
		if (message.deletable) message.delete();

		if (!args[0]) return message.channel.send('No');

		if (args[0].toLowerCase() == 'add') {
			try {
				// Connect to new node
				new Node({
					host: (args[1]) ? args[1] : 'localhost',
					password: (args[2]) ? args[2] : 'youshallnotpass',
					port: (args[3]) ? args[3] : 5000,
				}).connect();
				message.channel.send('Successfully added new node');
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
		} else if (args[0].toLowerCase() == 'remove') {
			try {
				new Node({
					host: (args[1]) ? args[1] : 'localhost',
					password: (args[2]) ? args[2] : 'youshallnotpass',
					port: (args[3]) ? args[3] : 5000,
				}).destroy();
				message.channel.send('Successfully removed node');
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			message.channel.send('Incorrect details');
		}
	}
};
