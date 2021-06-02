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
			usage: 'node <add / remove> [host] [password] [port]',
			cooldown: 3000,
			examples: ['node add localhost youshallnotpass 5000'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// delete message
		if (message.deletable) message.delete();

		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/node:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		if (message.args[0].toLowerCase() == 'add') {
			try {
				// Connect to new node
				await new Node({
					host: message.args[1] ?? 'localhost',
					password: message.args[2] ?? 'youshallnotpass',
					port: message.args[3] ?? 5000,
				}).connect();
				message.channel.success('host/node:ADDED_NODE');
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else if (message.args[0].toLowerCase() == 'remove') {
			try {
				await new Node({
					host: message.args[1] ?? 'localhost',
					password: message.args[2] ?? 'youshallnotpass',
					port: message.args[3] ?? 5000,
				}).destroy();
				message.channel.success('host/node:REMOVED_NODE');
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/node:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
