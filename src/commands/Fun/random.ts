import { CommandInteraction, Guild } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Command from 'src/structures/Command';

/**
 * Random command
 * @extends {Command}
*/
export default class Random extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
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

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client: EgglordClient, interaction: CommandInteraction, guild: Guild, args: any) {
		const command = client.subCommands.get(`random-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}
