import Command from '../../structures/Command';
import { ApplicationCommandOptionData, ApplicationCommandOptionType, ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import EgglordClient from '../../base/Egglord';

export default class Ticket extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'ticket',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['ticket'],
			userPermissions: [PermissionFlagsBits.ManageGuild],
			botPermissions: [PermissionFlagsBits.AddReactions],
			description: 'Information on ticket plugin.',
			usage: 'ticket',
			cooldown: 3000,
			slash: true,
			options: client.commandManager.subCommands.filter(c => c.help.name.startsWith('ticket-')).map(c => ({
				name: c.help.name.replace('ticket-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})) as ApplicationCommandOptionData[],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		const option = message.args[0];

		const command = client.commandManager.get(`ticket-${option}`);
		if (command) return command.run(client, message);
		message.channel.send({ content: 'Error' });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const option = interaction.options.getSubcommand();

		const command = client.commandManager.get(`ticket-${option}`);
		if (command) return command.callback(client, interaction);
		interaction.reply({ content: 'Error' });
	}
}

