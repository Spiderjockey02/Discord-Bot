import EgglordClient from '../../base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, Guild, User, UserContextMenuCommandInteraction } from 'discord.js';

/**
 * Avatar command
 * @extends {Command}
*/
export default class Avatar extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'avatar',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['av'],
			description: 'Displays user\'s avatar.',
			usage: 'avatar [user]',
			cooldown: 2000,
			examples: ['avatar userID', 'avatar @mention', 'avatar username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want the avatar of',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// Get avatar embed
		const members = await message.getMember();
		const embed = this.createAvatarEmbed(client, message.guild, members[0].user);

		// send embed
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const embed = this.createAvatarEmbed(client, interaction.guild, user);

		// send embed
		return interaction.reply({ embeds: [embed] });
	}

	reply(client: EgglordClient, interaction: UserContextMenuCommandInteraction) {
		const embed = this.createAvatarEmbed(client, null, interaction.targetUser);
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating avatar embed.
	 * @param {EgglordClient} client The instantiating client
	 * @param {Guild|null} guild The guild the command ran in
	 * @param {User} user The guildMember to get the avatar from
	 * @returns {embed}
	*/
	createAvatarEmbed(client: EgglordClient, guild: Guild | null, user: User) {
		return new EgglordEmbed(client, guild)
			.setTitle('guild/avatar:AVATAR_TITLE', { USER: user.displayName })
			.setDescription([
				`${client.languageManager.translate(guild, 'guild/avatar:AVATAR_DESCRIPTION')}`,
				`[png](${user.displayAvatarURL({ extension: 'png', size: 1024 })}) | [jpg](${user.displayAvatarURL({ extension: 'jpg', size: 1024 })}) | [gif](${user.displayAvatarURL({ extension: 'gif', size: 1024 })}) | [webp](${user.displayAvatarURL({ extension: 'webp', size: 1024 })})`,
			].join('\n'))
			.setImage(`${user.displayAvatarURL({ forceStatic: false, size: 1024 })}`);
	}
}

