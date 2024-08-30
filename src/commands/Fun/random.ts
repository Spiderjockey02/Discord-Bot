import { ChatInputCommandInteraction, Message } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import Command from '../../structures/Command';

/**
 * Random command
 * @extends {Command}
*/
export default class Random extends Command {
	constructor() {
		super({
			name: 'random',
			dirname: __dirname,
			description: 'Random number or caps',
			usage: 'random',
			cooldown: 1000,
			examples: ['random'],
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		const command = client.commandManager.subCommands.get(`random-${message.args[0]}`);
		if (command) {
			command.run(client, message);
		} else {
			message.channel.send({ content: 'error' });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const command = client.commandManager.subCommands.get(`random-${interaction.options}`);
		if (command) {
			command.callback(client, interaction);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}
