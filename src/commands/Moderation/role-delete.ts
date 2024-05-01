// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Delrole command
 * @extends {Command}
*/
export default class DelRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'role-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['removerole', 'deleterole'],
			userPermissions: [Flags.ManageRoles],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles],
			description: 'Delete a role from the server.',
			usage: 'delrole <role>',
			cooldown: 5000,
			examples: ['delrole Test'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'role',
					description: 'The role to delete.',
					type: ApplicationCommandOptionType.Role,
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

		// Make sure a role name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/delrole:USAGE')) });

		// find role based on mention, ID or name
		const role = message.getRole();

		// No role was found
		if (!role[0]) return message.channel.error('moderation/delrole:MISSING');

		// delete role
		try {
			const delRole = await role[0].delete();
			message.channel.success('moderation/delrole:SUCCESS', { ROLE: delRole.name }).then(m => m.timedDelete({ timeout: 3000 }));
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('moderation/delrole:FAIL');
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
		const role = guild.roles.cache.get(args.get('role').value),
			channel = guild.channels.cache.get(interaction.channelId);

		// delete role
		try {
			const delRole = await role.delete();
			interaction.reply({ embeds: [channel.success('moderation/delrole:SUCCESS', { ROLE: delRole.name }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 3000 }));
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('moderation/delrole:FAIL', {}, true)], ephemeral: true });
		}
	}
}

