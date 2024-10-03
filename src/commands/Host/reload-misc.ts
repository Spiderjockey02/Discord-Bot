import EgglordClient from 'base/Egglord';
import Command from '../../structures/Command';
import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

/**
 * Reload command
 * @extends {Command}
*/
export default class Reload extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
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

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const feature = interaction.options.getString('feature', true);
		let successCount = 0;

		// loop through each guild
		switch (feature) {
			case 'interactions':
				await interaction.reply({ content: `=-=-=-=-=-=-=- Loading interactions for ${client.guilds.cache.size} guilds -=-=-=-=-=-=-=` });

				// Upload per server interactions
				for (const guild of [...client.guilds.cache.values()]) {
					const activeCommands = await client.commandManager.fetchByGuildId(guild.id);

					const commandData: ApplicationCommandDataResolvable[] = [];
					for (const cmd of activeCommands) {
						// Get the command
						const command = client.commandManager.get(cmd.name);
						if (command == undefined) break;

						// If it is a slash command then start parsing it, ready for deployment
						if (command.conf.slash) {
							const item: ApplicationCommandDataResolvable = {
								name: command.help.name,
								description: command.help.description,
								nsfw: command.conf.nsfw,
								defaultMemberPermissions: command.conf.userPermissions.length >= 1 ? command.conf.userPermissions : PermissionFlagsBits.SendMessages,
								options: [],
							};
							if (command.conf.options.length > 0) item.options = command.conf.options;
							commandData.push(item);
						}
					}

					// For the "Host" commands
					if (guild.id == client.config.SupportServer.GuildID) {
						const cmds = await client.commandManager.commands.filter(c => c.help.category == 'Host');
						for (const cmd of [...cmds.values()]) {
							if (cmd.conf.slash) {
								const item: ApplicationCommandDataResolvable = {
									name: cmd.help.name,
									description: cmd.help.description,
									nsfw: cmd.conf.nsfw,
									defaultMemberPermissions: PermissionFlagsBits.Administrator,
									options: [],
								};
								if (cmd.conf.options.length > 0) item.options = cmd.conf.options;
								commandData.push(item);
							}
						}
					}

					// get context menus
					try {
						await client.guilds.cache.get(guild.id)?.commands.set(commandData);
						client.logger.log(`Loaded interactions for guild: ${guild.name}`);
						successCount++;
					} catch (err: any) {
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

