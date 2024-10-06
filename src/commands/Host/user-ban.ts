import EgglordClient from '../../base/Egglord';
import { Command, ErrorEmbed, SuccessEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';

/**
 * Lavalink command
 * @extends {Command}
*/
export default class UserBan extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'user-ban',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Update the user\'s premium status',
			usage: 'user bane [@user] [Boolean]',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'user',
				description: 'The user',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
			{
				name: 'banned',
				description: 'The banned status',
				type: ApplicationCommandOptionType.Boolean,
				required: true,
			}],
		});
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user', true),
			bannedStatus = interaction.options.getBoolean('banned', true);

		// Make sure user isn't trying to punish themselves
		if (user.id == interaction.user.id) {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:SELF_PUNISH');
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		try {
			await client.databaseHandler.userManager.update(user.id, { isBanned: bannedStatus });
			user.isBanned = bannedStatus;

			const embed = new SuccessEmbed(client, interaction.guild)
				.setMessage('host/user:SUCCESS_BAN');
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
}

