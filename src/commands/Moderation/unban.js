// Dependencies
const	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Unban command
 * @extends {Command}
*/
class Unban extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'unban',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-ban'],
			userPermissions: [Flags.BanMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.BanMembers],
			description: 'Unban a user.',
			usage: 'unban <userID> [reason]',
			cooldown: 5000,
			examples: ['unban 184376969016639488'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to deafen.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Unban user
		const user = message.args[0];
		try {
			await message.guild.bans.fetch().then(async bans => {
				if (bans.size == 0) return message.channel.error('moderation/unban:NO_ONE');
				const bUser = bans.find(ban => ban.user.id == user);
				if (bUser) {
					await message.guild.members.unban(bUser.user);
					message.channel.success('moderation/unban:SUCCESS', { USER: bUser.user });
				} else {
					message.channel.error('moderation/unban:MISSING', { ID: user });
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
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
		const userID = args.get('user').value,
			channel = guild.channels.cache.get(interaction.channelId);

		// Unban user
		try {
			await guild.bans.fetch().then(async bans => {
				if (bans.size == 0) return interaction.reply({ embeds: [channel.error('moderation/unban:NO_ONE', null, true)] });
				const bUser = bans.get(userID);
				if (bUser) {
					await guild.members.unban(bUser.user);
					interaction.reply({ embeds: [channel.error('moderation/unban:SUCCESS', { USER: bUser.user }, true)] });
				} else {
					interaction.reply({ embeds: [channel.error('moderation/unban:MISSING', { ID: userID }, true)] });
				}
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Unban;
