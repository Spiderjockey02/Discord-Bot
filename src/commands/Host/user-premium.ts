import EgglordClient from 'base/Egglord';
import { Command, ErrorEmbed, SuccessEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';

export default class UserPremium extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'user-premium',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Update the user\'s premium status',
			usage: 'user premium [user] [Date]',
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
				name: 'premium',
				description: 'The day when premium will run out',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const	user = interaction.options.getUser('user', true),
			premiumStatus = interaction.options.getString('premium', true);

		try {
			await client.databaseHandler.userManager.update(user.id, { isPremiumTo: new Date(premiumStatus) });
			user.isPremiumTo = new Date(premiumStatus);

			const embed = new SuccessEmbed(client, interaction.guild)
				.setMessage('host/user:SUCCESS_PREM');
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
}

