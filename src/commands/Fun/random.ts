import { ApplicationCommandOption, ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import Command from '../../structures/Command';

/**
 * Random command
 * @extends {Command}
*/
export default class Random extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'random',
			dirname: __dirname,
			description: 'Random number or caps',
			usage: 'random',
			cooldown: 1000,
			examples: ['random'],
			slash: true,
			options: client.commandManager.subCommands.filter(c => c.help.name.startsWith('random-')).map(c => ({
				name: c.help.name.replace('random-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})) as ApplicationCommandOption[],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const command = client.commandManager.get(`random-${message.args[0]}`);
		if (command) {
			command.run(client, message);
		} else {
			message.channel.send({ content: 'error' });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const command = client.commandManager.get(`random-${interaction.options}`);
		if (command) {
			command.callback(client, interaction);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}
