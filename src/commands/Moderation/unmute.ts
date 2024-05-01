// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Unmute command
 * @extends {Command}
*/
export default class Unmute extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name:  'unmute',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-mute'],
			userPermissions: [Flags.MuteMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.MuteMembers, Flags.ManageRoles],
			description: 'Unmute a user.',
			usage: 'unmute <user>',
			cooldown: 2000,
			examples: ['unmute username'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to mute.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Find user
		const members = await message.getMember();

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (channel) {
			// Make sure client can deafen members
			if (!channel.permissionsFor(client.user).has(Flags.MuteMembers)) {
				client.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:MUTE_MEMBERS') });
			}
		}

		// Remove mutedRole from user
		try {
			await members[0].timeout(null, `${message.author.id} put user out of timeout`);
			message.channel.success('moderation/unmute:SUCCESS', { USER: members[0].user });
		} catch (err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user').value);

		// Get the channel the member is in
		const channel = guild.channels.cache.get(member.voice.channelID);
		if (channel) {
			// Make sure client can deafen members
			if (!channel.permissionsFor(client.user).has(Flags.MuteMembers)) {
				client.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:MUTE_MEMBERS') }, true)] });
			}
		}

		// Remove mutedRole from user
		try {
			await member.timeout(null, `${interaction.user.id} put user out of timeout`);
			interaction.reply({ embeds: [channel.error('moderation/unmute:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

