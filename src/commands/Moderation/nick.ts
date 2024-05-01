// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Nick command
 * @extends {Command}
*/
export default class Nick extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'nick',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['nickname', 'setnick'],
			userPermissions: [Flags.ChangeNickname, Flags.ManageNicknames],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageNicknames],
			description: 'Change the nickname of a user.',
			usage: 'nick <user> <name>',
			cooldown: 3000,
			examples: ['nick username Not a nice name'],
			slash: true,
			options: [
				{
					name: 'name',
					description: 'The nickname to give the user.',
					type: ApplicationCommandOptionType.String,
					maxLength: 32,
					required: true,
				},
				{
					name: 'user',
					description: 'The user to change nickname.',
					type: ApplicationCommandOptionType.User,
					required: false,
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/ban:USAGE')) });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		// Make sure user user does not have ADMINISTRATOR permissions
		if (members[0].permissions.has(Flags.Administrator) || (members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) > 0)) {
			return message.channel.error('moderation/nick:TOO_POWERFUL');
		}

		// Make sure a nickname was provided in the command
		if (message.args.length == 0) return message.channel.error('moderation/nick:ENTER_NICKNAME');

		// Get the nickanme
		const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

		// Make sure nickname is NOT longer than 32 characters
		if (nickname.length >= 32) return message.channel.error('moderation/nick:LONG_NICKNAME');

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await members[0].setNickname(nickname);
			message.channel.success('moderation/nick:SUCCESS', { USER: members[0].user });
		} catch (err) {
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
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			nickname = args.get('nickname')?.value ?? null;

		// Make sure user user does not have ADMINISTRATOR permissions
		if (member.permissions.has(Flags.Administrator) || (member.roles.highest.comparePositionTo(guild.members.me.roles.highest) > 0)) {
			interaction.reply({ embeds: [channel.error('moderation/nick:TOO_POWERFUL', null, true)] });
		}


		// Change nickname and tell user (send error message if dosen't work)
		try {
			await member.setNickname(nickname);
			interaction.reply({ embeds: [channel.success('moderation/nick:SUCCESS', { USER: member.user }, true)] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

