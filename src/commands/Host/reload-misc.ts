// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags }, ApplicationCommandType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Reload command
 * @extends {Command}
*/
export default class Reload extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'reload-misc',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Reloads a feature.',
			usage: 'reload command',
			cooldown: 3000,
			examples: ['reload help'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'feature',
				description: 'Feature to reload',
				type: ApplicationCommandOptionType.String,
				choices: ['language', 'interactions'].map(i => ({ name: i, value: i })),
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const feature = args.get('feature').value,
			channel = guild.channels.cache.get(interaction.channelId);
		let successCount = 0;

		// loop through each guild
		switch (feature) {
			case 'language':
				try {
					client.translations = await require('../../helpers/LanguageManager')();
				} catch (err) {
					client.logger.error(`Command: '${this.help.name}' has error: ${err}.`);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
				}
				break;
			case 'interactions':
				await interaction.reply({ content: `=-=-=-=-=-=-=- Loading interactions for ${client.guilds.cache.size} guilds -=-=-=-=-=-=-=` });

				// Upload per server interactions
				for (const g of [...client.guilds.cache.values()]) {
					const enabledPlugins = g.settings.plugins;
					const cmdsToUpload = [];
					for (const plugin of enabledPlugins) {
						const data = await client.loadInteractionGroup(plugin, g);
						if (Array.isArray(data)) cmdsToUpload.push(...data);

					}

					// For the "Host" commands
					if (g.id == client.config.SupportServer.GuildID) {
						const cmds = await client.loadInteractionGroup('Host', g);
						for (const cmd of cmds) {
							cmd.defaultMemberPermissions = [Flags.Administrator];
						}
						if (Array.isArray(cmds)) cmdsToUpload.push(...cmds);
					}

					// get context menus
					try {
						await client.guilds.cache.get(g.id)?.commands.set(cmdsToUpload);
						client.logger.log('Loaded interactions for guild: ' + g.name);
						successCount++;
					} catch (err) {
						client.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
					}
				}

				// Upload global interactions
				client.application.commands.set([{ name: 'Add to Queue', type: ApplicationCommandType.Message },
					{ name: 'Translate', type: ApplicationCommandType.Message },
					{ name: 'OCR', type: ApplicationCommandType.Message },
					{ name: 'Avatar', type: ApplicationCommandType.User },
					{ name: 'Userinfo', type: ApplicationCommandType.User },
					{ name: 'Screenshot', type: ApplicationCommandType.Message },
					{ name: 'Report', type: ApplicationCommandType.Message },
					{ name: 'Report', type: ApplicationCommandType.User },
				]);

				interaction.editReply({ content: `Successfully updated ${successCount}/${client.guilds.cache.size} servers' interactions.` });
				break;
			default:

		}
	}
}

