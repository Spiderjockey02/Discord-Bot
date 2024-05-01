// Dependencies
const	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Undeafen command
 * @extends {Command}
*/
export default class Undeafen extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'undeafen',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['undeaf', 'un-deafen'],
			userPermissions: [Flags.DeafenMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.DeafenMembers],
			description: 'Undeafen a user.',
			usage: 'undeafen <user>',
			cooldown: 2000,
			examples: ['undeafen username'],
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to undeafen.',
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

		// Checks to make sure user is in the server
		const members = await message.getMember();

		// Make sure that the user is in a voice channel
		if (members[0]?.voice.channel) {
			// Make sure client can deafen members
			if (!members[0].voice.channel.permissionsFor(client.user).has(Flags.DeafenMembers)) {
				client.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:DEAFEN_MEMBERS') });
			}

			// Make sure user isn't trying to punish themselves
			if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH');

			try {
				await members[0].voice.setDeaf(false);
				message.channel.success('moderation/undeafen:SUCCESS', { USER: members[0].user });
			} catch(err) {
				if (message.deletable) message.delete();
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			message.channel.error('moderation/undeafen:NOT_VC');
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
		const member = guild.members.cache.get(args.get('user').value),
			channel = guild.channels.cache.get(interaction.channelId);

		// Make sure that the user is in a voice channel
		if (member.voice.channel) {
			// Make sure client can deafen members
			if (!member.voice.channel.permissionsFor(client.user).has(Flags.DeafenMembers)) {
				client.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:DEAFEN_MEMBERS') }, true)] });
			}

			// Make sure user isn't trying to punish themselves
			if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

			try {
				await member.voice.setDeaf(false);
				interaction.reply({ embeds: [channel.success('moderation/undeafen:SUCCESS', { USER: member.user }, true)] });
			} catch(err) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
			}
		} else {
			interaction.reply({ embeds: [channel.error('moderation/undeafen:NOT_VC', null, true)] });
		}
	}
}

