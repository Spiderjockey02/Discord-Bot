// Dependecies
const defaultPlugins = ['Fun', 'Giveaway', 'Guild', 'Image', 'Level', 'Misc', 'Moderation', 'Music', 'NSFW', 'Plugins', 'Recording', 'Searcher', 'Ticket', 'Tags'],
	Command = require('../../structures/Command.js');

module.exports = class SetPlugin extends Command {
	constructor(bot) {
		super(bot, {
			name: 'set-plugin',
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

		// Make sure user can edit server plugins
		if (!message.member.permissions.has('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => setTimeout(() => { m.delete(); }, 10000));

		// Make sure something was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// make sure it's a real plugin
		if (defaultPlugins.includes(message.args[0])) {
			if (!settings.plugins.includes(message.args[0])) {
				settings.plugins.push(message.args[0]);
				message.channel.send(`Added ${message.args[0]} to Guild's plugins.`);
			} else {
				settings.plugins.splice(settings.plugins.indexOf(message.args[0]), 1);
				message.channel.send(`Removed ${message.args[0]} to Guild's plugins.`);
			}
			try {
				await message.guild.updateGuild({ plugins: settings.plugins });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			}
		} else {
			return message.channel.send('Not a supported plugin');
		}

	}
};
