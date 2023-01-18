// Dependencies
const Event = require('../../structures/Event');

/**
 * SelectMenuSubmit event
 * @event Egglord#SelectMenuSubmit
 * @extends {Event}
*/
class SelectMenuSubmit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {ModalSubmitInteraction} interaction The member that was warned
	 * @readonly
	*/
	async run(bot, interaction) {
		const guild = bot.guilds.cache.get(interaction.guildId),
			channel = guild.channels.cache.get(interaction.channelId);

		switch (interaction.customId) {
			case 'plugin_change': {
				// Fetch slash command data
				const data = [];
				for (const plugin of guild.settings.plugins) {
					const g = await bot.loadInteractionGroup(plugin, guild);
					if (Array.isArray(g)) data.push(...g);
				}

				try {
					await guild.commands.set(data);
					interaction.reply({ embeds: [channel.success('plugins/set-plugin:ADDED', { PLUGINS: interaction.values }, true)] });
				} catch (err) {
					console.log(err);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
				}
				break;
			}
			default:

		}
	}
}

module.exports = SelectMenuSubmit;
