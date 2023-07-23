// Dependencies
const	{ ApplicationCommandOptionType } = require('discord.js'),
	{ userSchema } = require('../../database/models'),
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
			name: 'user-ban',
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
			},
			{
				name: 'banned',
				description: 'The banned status',
				type: ApplicationCommandOptionType.Boolean,
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
		const channel = guild.channels.cache.get(interaction.channelId),
			user = bot.users.cache.get(args.get('user').value),
			bannedStatus = args.get('banned').value;

		// Make sure user isn't trying to punish themselves
		if (user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', {}, true)], ephermal: true });

		try {
			const resp = await userSchema.findOne({ userID: user.id	});
			if (!resp) {
				await (new userSchema({
					userID: user.id,
					cmdBanned: bannedStatus,
				})).save();
			} else {
				await userSchema.findOneAndUpdate({ userID: user.id }, { cmdBanned: bannedStatus });
			}
			user.cmdBanned = bannedStatus;
			interaction.reply({ embeds: [channel.success('host/user:SUCCESS_BAN', null, true)] });
		} catch (err) {
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = UserBan;
