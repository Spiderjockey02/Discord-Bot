// Dependecies
const defaultPlugins = ['Fun', 'Giveaway', 'Guild', 'Image', 'Level', 'Misc', 'Moderation', 'Music', 'NSFW', 'Plugins', 'Recording', 'Searcher', 'Ticket', 'Tags'],
	Command = require('../../structures/Command.js');

module.exports = class SetPlugin extends Command {
	constructor(bot) {
		super(bot, {
			name: 'set-plugin',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setplugin'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Toggle plugins on and off',
			usage: 'set-plugin <option>',
			cooldown: 5000,
			examples: ['set-plugin <option>'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('plugins/set-plugin:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure it's a real plugin
		if (defaultPlugins.includes(message.args[0])) {
			if (!settings.plugins.includes(message.args[0])) {
				settings.plugins.push(message.args[0]);
				message.channel.send(message.translate('plugins/set-plugin:ADDED', { PLUGINS: message.args[0] }));
			} else {
				settings.plugins.splice(settings.plugins.indexOf(message.args[0]), 1);
				message.channel.send(message.translate('plugins/set-plugin:REMOVED', { PLUGINS: message.args[0] }));
			}
			try {
				await message.guild.updateGuild({ plugins: settings.plugins });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			return message.channel.send(message.translate('plugins/set-plugin:INVALID'));
		}

	}
};
