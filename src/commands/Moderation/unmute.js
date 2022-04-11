// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Unmute command
 * @extends {Command}
*/
class Unmute extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name:  'unmute',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-mute'],
			userPermissions: ['MUTE_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MUTE_MEMBERS', 'MANAGE_ROLES'],
			description: 'Unmute a user.',
			usage: 'unmute <user>',
			cooldown: 2000,
			examples: ['unmute username'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to mute.',
					type: 'USER',
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

		// Find user
		const members = await message.getMember();

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:MUTE_MEMBERS') }).then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Remove mutedRole from user
		try {
			await members[0].timeout(null, `${message.author.id} put user out of timeout`);
			message.channel.success('moderation/unmute:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
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
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:MUTE_MEMBERS') }, true)] });
			}
		}

		// Remove mutedRole from user
		try {
			await member.timeout(null, `${interaction.user.id} put user out of timeout`);
			interaction.reply({ embeds: [channel.error('moderation/unmute:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Unmute;
