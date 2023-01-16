// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Deafen command
 * @extends {Command}
*/
class Deafen extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'deafen',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.DeafenMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.DeafenMembers],
			description: 'Deafen a user.',
			usage: 'deafen <user>',
			cooldown: 2000,
			examples: ['deafen username'],
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/deafen:USAGE')) });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		// Make sure that the user is in a voice channel
		if (members[0]?.voice.channel) {
			// Make sure bot can deafen members
			if (!members[0].voice.channel.permissionsFor(bot.user).has(Flags.DeafenMembers)) {
				bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:DEAFEN_MEMBERS') });
			}

			// Make sure user isn't trying to punish themselves
			if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH');

			try {
				await members[0].voice.setDeaf(true);
				message.channel.success('moderation/deafen:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
			} catch(err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			message.channel.error('moderation/deafen:NOT_VC');
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
		const member = guild.members.cache.get(args.get('').value),
			channel = guild.channels.cache.get(interaction.channelId);

		// Make sure that the user is in a voice channel
		if (member.voice.channel) {
			// Make sure bot can deafen members
			if (!member.voice.channel.permissionsFor(bot.user).has(Flags.DeafenMembers)) {
				bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:DEAFEN_MEMBERS') }, true)], ephemeral: true });
			}

			// Make sure user isn't trying to punish themselves
			if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', {}, true)], ephemeral: true });

			try {
				await member.voice.setDeaf(true);
				interaction.reply({ embeds: [channel.success('moderation/deafen:SUCCESS', { USER: member.user }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 3000 }));
			} catch(err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		} else {
			interaction.reply({ embeds: [channel.error('moderation/deafen:NOT_VC', {}, true)], ephemeral: true });
		}
	}
}

module.exports = Deafen;
