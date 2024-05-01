// Dependencies
const { WarningSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * ClearWarning command
 * @extends {Command}
*/
export default class ClearWarning extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'clear-warning',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl-warning', 'cl-warnings', 'clear-warnings'],
			userPermissions: [Flags.KickMembers],
			description: 'Remove warnings from a user.',
			usage: 'clear-warning <user> [warning number]',
			cooldown: 5000,
			examples: ['clear-warning username'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'user',
					description: 'The user to clear warning from.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'warn-num',
					description: 'The warning number.',
					type: ApplicationCommandOptionType.Integer,
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
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear-warning:USAGE')) });


		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		// get warnings of user
		try {
			// find data
			const warns = await WarningSchema.find({
				userID: members[0].user.id,
				guildID: message.guild.id,
			});

			// check if a warning number was entered
			if (message.args[1] - 1 <= warns.length) {
				// Delete item from database as client didn't crash
				await WarningSchema.findByIdAndRemove(warns[message.args[1] - 1]._id);
			} else {
				await WarningSchema.deleteMany({ userID: members[0].user.id, guildID: message.guild.id });
			}
			message.channel.send(message.translate('moderation/clear-warning:CLEARED', { MEMBER: members[0] }));
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
		const member = guild.members.cache.get(args.get('user').value),
			channel = guild.channels.cache.get(interaction.channelId),
			num = args.get('warn-num').value;

		// get warnings of user
		try {
			// find data
			const warns = await WarningSchema.find({
				userID: member.user.id,
				guildID: guild.id,
			});

			// check if a warning number was entered
			if (num - 1 <= warns.length) {
				// Delete item from database as client didn't crash
				await WarningSchema.findByIdAndRemove(warns[num - 1]._id);
			} else {
				await WarningSchema.deleteMany({ userID: member.user.id, guildID: guild.id });
			}
			interaction.reply(guild.translate('moderation/clear-warning:CLEARED', { MEMBER: member }));
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

