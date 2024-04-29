// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, GuildMember } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

/**
 * Avatar command
 * @extends {Command}
*/
class Avatar extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
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

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Get avatar embed
		const members = await message.getMember();
		const embed = this.avatarEmbed(bot, message.guild, members[0]);

		// send embed
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving slash command.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);
		const embed = this.avatarEmbed(bot, guild, member);

		// send embed
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for receiving context menu
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	reply(bot, interaction, channel, userID) {
		let member;
		if (channel.type == ChannelType.DM) {
			member = new GuildMember(bot, { user: bot.users.cache.get(userID) });
		} else {
			member = channel.guild.members.cache.get(userID);
		}

		// send embed
		const embed = this.avatarEmbed(bot, false, member);
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating avatar embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {member} GuildMember The guildMember to get the avatar from
	 * @returns {embed}
	*/
	avatarEmbed(bot, guild, member) {
		return new Embed(bot, guild)
			.setTitle('guild/avatar:AVATAR_TITLE', { USER: member.user.displayName })
			.setDescription([
				`${bot.translate('guild/avatar:AVATAR_DESCRIPTION')}`,
				`[png](${member.user.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${member.user.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${member.user.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${member.user.displayAvatarURL({ format: 'webp', size: 1024 })})`,
			].join('\n'))
			.setImage(`${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
	}
}

module.exports = Avatar;
