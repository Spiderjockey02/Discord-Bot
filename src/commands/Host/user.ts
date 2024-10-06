import EgglordClient from 'base/Egglord';
import { Command } from '../../structures';
import { ApplicationCommandOptionData, ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';

/**
 * User command
 * @extends {Command}
*/
export default class User extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'user',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Edit a user\'s data',
			usage: 'user <id>',
			cooldown: 3000,
			examples: ['user 184376969016639488 premium true'],
			slash: true,
			options: client.commandManager.subCommands.filter(c => c.help.name.startsWith('user-')).map(c => ({
				name: c.help.name.replace('user-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})) as ApplicationCommandOptionData[],
		});
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const command = client.commandManager.subCommands.get(`user-${interaction.options.getSubcommand()}`);
		if (command) return command.callback(client, interaction);
		interaction.reply({ content: 'Error', ephemeral: true });
	}
}

