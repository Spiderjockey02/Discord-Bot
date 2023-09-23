// Dependencies
const	{ ApplicationCommandOptionType, EmbedBuilder } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

/**
 * Lavalink command
 * @extends {Command}
*/
class UserBan extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'user-info',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'user',
				description: 'The user to update banned status',
				type: ApplicationCommandOptionType.User,
				required: true,
			}],
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const user = bot.users.cache.get(args.get('user').value);

		const embed = new EmbedBuilder()
			.setTitle('User Information:')
			.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
			.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
			.setDescription([
				`Username: \`${user.displayName}\``,
				`ID: \`${user.id}\``,
				`Creation Date: \`${moment(user.createdAt).format('lll')}\``,
				'',
				`Premium: \`${user.premium}\`${user.premium ? ` (${(new Date(parseInt(user.premiumSince)).toLocaleString()).split(',')[0]})` : ''}.`,
				`Is banned: \`${user.cmdBanned}\``,
				`No. of mutual servers: \`${bot.guilds.cache.filter(g => g.members.cache.get(user.id)).size}\``,
			].join('\n'));
		interaction.reply({ embeds: [embed] });
	}
}

module.exports = UserBan;
