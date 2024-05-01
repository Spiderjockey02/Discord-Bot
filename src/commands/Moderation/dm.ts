// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * DM command
 * @extends {Command}
*/
export default class DM extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'dm',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['direct-message', 'dmsg'],
			userPermissions: [Flags.ManageGuild],
			description: 'DM a user',
			usage: 'dm <user> <message>',
			cooldown: 3000,
			examples: ['dm username Hello'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to direct message.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'message',
					description: 'The message to send the user.',
					type: ApplicationCommandOptionType.String,
					maxLength: 4096,
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
		// Make sure a member was mentioned
		if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/dm:USAGE')) });

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		// send message
		try {
			const embed = new Embed(client, message.guild)
				.setTitle('moderation/dm:TITLE', { NAME: message.guild.name })
				.setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
				.setDescription(message.args.join(' ').slice(message.args[0].length))
				.setTimestamp()
				.setFooter({ text: message.author.displayName, iconURL: message.author.displayAvatarURL({ format: 'png', size: 1024 }) });
			await members[0].user.send({ embeds: [embed] });
			message.channel.send(message.translate('moderation/dm:SUCCESS', { TAG: members[0].user.displayName }));
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
			text = args.get('message').value;

		// send message
		try {
			const embed = new Embed(client, guild)
				.setTitle('moderation/dm:TITLE', { NAME: guild.name })
				.setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
				.setDescription(text)
				.setTimestamp()
				.setFooter({ text: interaction.user.displayName, icon_url: interaction.user.displayAvatarURL({ format: 'png', size: 1024 }) });
			await member.user.send({ embeds: [embed] });
			interaction.reply({ embeds: [channel.success('moderation/dm:SUCCESS', { TAG: member.user.displayName }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 10000 }));
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

