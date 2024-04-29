// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Mute command
 * @extends {Command}
*/
class Mute extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'mute',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['timeout'],
			userPermissions: [Flags.MuteMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles],
			description: 'Put a user in timeout.',
			usage: 'mute <user> [time]',
			cooldown: 2000,
			examples: ['mute username', 'mute username 5m'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to mute.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'time',
					description: 'The time till they are unmuted.',
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
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/mute:USAGE')) });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has(Flags.MuteMembers)) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:MUTE_MEMBERS') });
			}
		}

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH');

		// put user in timeout
		try {
			const { error, success: time } = getTotalTime(message.args[1] ?? (28 * 86400000));
			if (error) return message.channel.error(error);

			// default time is 28 days
			await members[0].timeout(time, `${message.author.id} put user in timeout`);
			message.channel.success('moderation/mute:SUCCESS', { USER: members[0].user });
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
		const member = guild.members.cache.get(args.get('user').value);

		// Get the channel the member is in
		const channel = guild.channels.cache.get(member.voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has(Flags.MuteMembers)) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:MUTE_MEMBERS') }, true)] });
			}
		}

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

		// put user in timeout
		try {
			// default time is 28 days
			const { error, success: time } = getTotalTime(args.get('time').value ?? (28 * 86400000));
			if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });

			await member.timeout(time, `${interaction.user.id} put user in timeout`);
			interaction.reply({ embeds: [channel.success('moderation/mute:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Mute;
