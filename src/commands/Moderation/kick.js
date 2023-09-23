// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Kick command
 * @extends {Command}
*/
class Kick extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'kick',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.KickMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.KickMembers],
			description: 'Kick a user.',
			usage: 'kick <user> [reason]',
			cooldown: 5000,
			examples: ['kick username spamming chat'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to kick.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason to kick user.',
					type: ApplicationCommandOptionType.String,
					required: false,
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/kick:USAGE')) });


		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		const	reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH');

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (members[0].permissions.has(Flags.Administrator) || members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			return message.channel.error('moderation/kick:TOO_POWERFUL');
		}

		// Kick user with reason
		try {
			// send DM to user
			try {
				const embed = new Embed(bot, message.guild)
					.setTitle('moderation/kick:TITLE')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('moderation/kick:DESC', { NAME: message.guild.name }))
					.addFields(
						{ name: message.translate('moderation/kick:KICKED'), value: message.author.displayName, inline: true },
						{ name: message.translate('misc:REASON'), value: reason, inline: true },
					);
				await members[0].send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// kick user from guild
			await members[0].kick({ reason: reason });
			message.channel.success('moderation/kick:SUCCESS', { USER: members[0].user });
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
		const member = guild.members.cache.get(args.get('user').value),
			channel = guild.channels.cache.get(interaction.channelId),
			reason = args.get('reason')?.value;

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (member.permissions.has(Flags.Administrator) || member.roles.highest.comparePositionTo(guild.members.me.roles.highest) >= 0) {
			return interaction.reply({ embeds: [channel.error('moderation/kick:TOO_POWERFUL', null, true)] });
		}

		// Kick user with reason
		try {
			// send DM to user
			try {
				const embed = new Embed(bot, guild)
					.setTitle('moderation/kick:TITLE')
					.setColor(15158332)
					.setThumbnail(guild.iconURL())
					.setDescription(guild.translate('moderation/kick:DESC', { NAME: guild.name }))
					.addFields(
						{ name: guild.translate('moderation/kick:KICKED'), value:  interaction.user.displayName, inline: true },
						{ name: guild.translate('misc:REASON'), value: reason, inline: true },
					);
				await member.send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// kick user from guild
			await member.kick({ reason: reason });
			interaction.reply({ embeds: [channel.success('moderation/kick:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Kick;
