// Dependencies
const { Embed } = require('../../utils'),
	{ ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * set plugin command
 * @extends {Command}
*/
class SetPlugin extends Command {
	/**
 * @param {Client} client The instantiating client
 * @param {CommandData} data The data for the command
*/
	constructor(bot) {
		super(bot, {
			name: 'settings-plugin',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setplugin'],
			userPermissions: [Flags.ManageGuild],
			description: 'Toggle plugins on and off',
			usage: 'set-plugin',
			cooldown: 5000,
			examples: ['set-plugin'],
			slash: false,
			isSubCmd: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Get all the command categories
		const defaultPlugins = bot.commands.map(c => c.help.category).filter((v, i, a) => a.indexOf(v) === i && v != 'Host');

		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure something was entered
		if (!message.args[0]) {
			const embed = new Embed(bot, message.guild)
				.setTitle('Plugins')
				.setDescription([
					`Available plugins: \`${defaultPlugins.filter(item => !settings.plugins.includes(item)).join('`, `') }\`.`,
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
					console.log(err.requestBody.json.map(i => i.name));
				}
				message.channel.success('plugins/set-plugin:ADDED', { PLUGINS: message.args[0] });
				if (settings.plugins.includes('Level')) await message.guild.fetchLevels();
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
					console.log(err.requestBody.json.map(i => i.name));
				}
				message.channel.success('plugins/set-plugin:REMOVED', { PLUGINS: message.args[0] });
			}

			try {
				await message.guild.updateGuild({ plugins: settings.plugins });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			return message.channel.error('plugins/set-plugin:INVALID');
		}
	}
	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const defaultPlugins = bot.commands.map(c => c.help.category).filter((v, i, a) => a.indexOf(v) === i && v != 'Host');

		const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('plugin_change')
					.setPlaceholder('Nothing selected')
					.setMinValues(1)
					.setMaxValues(defaultPlugins.length)
					.addOptions(defaultPlugins.map(p => ({
						label: p,
						description: 'This is a description',
						value: p,
						default: guild.settings.plugins.includes(p),
					})),
					),
			);

		await interaction.reply({ content: 'Enable plugins:', components: [row] });
	}
}

module.exports = SetPlugin;
