// Dependencies
const	{ ApplicationCommandOptionType } = require('discord.js'),
	{ userSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

/**
 * Lavalink command
 * @extends {Command}
*/
class UserPremium extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'user-premium',
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
				name: 'premium',
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
			premiumStatus = args.get('premium').value;

		try {
			const resp = await userSchema.findOne({ userID: user.id	});
			const time = Date.now();
			if (!resp) {
				await (new userSchema({
					userID: user.id,
					premium: premiumStatus,
					premiumSince: time,
				})).save();
			} else {
				await userSchema.findOneAndUpdate({ userID: user.id }, { premium: premiumStatus, premiumSince: Date.now() });
			}
			user.premium = premiumStatus;
			user.premiumSince = time;
			interaction.reply({ embeds: [channel.success('host/user:SUCCESS_PREM', null, true)] });
		} catch (err) {
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = UserPremium;
