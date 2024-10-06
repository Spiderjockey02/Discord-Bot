import EgglordClient from 'base/Egglord';
import { Command } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import moment from 'moment';

export default class UserBan extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'user-info',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Check the information of a user.',
			usage: 'user [@user]',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'user',
				description: 'The user to check',
				type: ApplicationCommandOptionType.User,
				required: true,
			}],
		});
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user', true);

		const embed = new EmbedBuilder()
			.setTitle('User Information:')
			.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL({ forceStatic: false, size: 1024 }) })
			.setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
			.setDescription([
				`Username: \`${user.displayName}\``,
				`ID: \`${user.id}\``,
				`Creation Date: \`${moment(user.createdAt).format('lll')}\``,
				'',
				`Premium: \`${user.isPremiumTo == null ? 'True' : 'False'}\`${user.isPremiumTo ? ` (${(new Date(user.isPremiumTo).toLocaleString()).split(',')[0]})` : ''}.`,
				`Is banned: \`${user.isBanned}\``,
				`No. of mutual servers: \`${client.guilds.cache.filter(g => g.members.cache.get(user.id)).size}\``,
			].join('\n'));
		interaction.reply({ embeds: [embed] });
	}
}

