// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

const defaultPlugins = ['Fun', 'Giveaway', 'Guild', 'Image', 'Level', 'Misc', 'Moderation', 'Music', 'NSFW', 'Plugins', 'Searcher', 'Ticket', 'Tags'];

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
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure something was entered
		if (!message.args[0]) {
			const embed = new Embed(bot, message.guild)
				.setTitle('Plugins')
				.setDescription([
					`Available plugins: \`${defaultPlugins.join('`, `') }\`.`,
					'',
					`Active plugins: \`${settings.plugins.join('`, `') }\`.`,
				].join('\n'));
			return message.channel.send({ embeds: [embed] });
		}

		// make sure it's a real plugin
		if (defaultPlugins.includes(message.args[0])) {
			if (!settings.plugins.includes(message.args[0])) {

				const data = [];
				settings.plugins.push(message.args[0]);

				// Fetch slash command data
				for (const plugin of settings.plugins) {
					const g = await bot.loadInteractionGroup(plugin, message.guild);
					if (Array.isArray(g)) data.push(...g);
				}

				try {
					await bot.guilds.cache.get(message.guild.id)?.commands.set(data);
				} catch (err) {
					console.log(err);
				}
				message.channel.success('plugins/set-plugin:ADDED', { PLUGINS: message.args[0] });
			} else {

				const data = [];
				settings.plugins.splice(settings.plugins.indexOf(message.args[0]), 1);
				// Fetch slash command data
				for (const plugin of settings.plugins) {
					const g = await bot.loadInteractionGroup(plugin, message.guild);
					if (Array.isArray(g)) data.push(...g);
				}

				try {
					await bot.guilds.cache.get(message.guild.id)?.commands.set(data);
				} catch (err) {
					console.log(err);
				}
				message.channel.success('plugins/set-plugin:REMOVED', { PLUGINS: message.args[0] });
			}

			try {
				await message.guild.updateGuild({ plugins: settings.plugins });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			return message.channel.send(message.translate('plugins/set-plugin:INVALID'));
		}

	}
};
