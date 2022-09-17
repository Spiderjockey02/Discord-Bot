// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Report command
 * @extends {Command}
*/
class Report extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'report',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['rep'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Report a user.',
			usage: 'report <user> [reason]',
			cooldown: 3000,
			examples: ['report username', 'report username swearing'],
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The user to report.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason to report the user.',
					type: ApplicationCommandOptionType.String,
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
		// Make sure that REPORT is in the mod logs
		if (settings.ModLogEvents?.includes('REPORT')) {

			// Delete command for privacy
			if (message.deletable) message.delete();

			// check if a user was entered
			if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/report:USAGE')) }).then(m => m.timedDelete({ timeout: 10000 }));

			// Get members mentioned in message
			const members = await message.getMember(false);

			// Make sure atleast a guildmember was found
			if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

			// Make sure user isn't trying to punish themselves
			if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.timedDelete({ timeout: 10000 }));

			// Make sure a reason was added
			if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/report:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

			// Send messages to ModLog channel
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: message.translate('moderation/report:AUTHOR'), iconURL: members[0].user.displayAvatarURL })
				.setColor(15158332)
				.addField(message.translate('moderation/report:MEMBER'), members[0], true)
				.addField(message.translate('moderation/report:BY'), message.member, true)
				.addField(message.translate('moderation/report:IN'), message.channel)
				.addField(message.translate('moderation/report:REASON'), message.args.slice(1).join(' '))
				.setTimestamp()
				.setFooter(message.guild.name);
			const repChannel = message.guild.channels.cache.find(channel => channel.id === settings.ModLogChannel);
			if (repChannel) {
				repChannel.send({ embeds: [embed] });
				message.channel.success('moderation/report:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
			}
		} else {
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Logging: `REPORTS` has not been setup' }).then(m => m.timedDelete({ timeout: 5000 }));
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
			reason = args.get('reason').value,
			{ settings } = guild;

		// Make sure that REPORT is in the mod logs
		if (settings.ModLogEvents?.includes('REPORT')) {

			// Make sure user isn't trying to punish themselves
			if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', null, true)] });

			// Send messages to ModLog channel
			const embed = new Embed(bot, guild)
				.setAuthor({ name: guild.translate('moderation/report:AUTHOR'), iconURL: member.user.displayAvatarURL() })
				.setColor(15158332)
				.addField(guild.translate('moderation/report:MEMBER'), member, true)
				.addField(guild.translate('moderation/report:BY'), interaction.member, true)
				.addField(guild.translate('moderation/report:IN'), interaction.channel)
				.addField(guild.translate('moderation/report:REASON'), reason)
				.setTimestamp()
				.setFooter(guild.name);
			const repChannel = guild.channels.cache.get(settings.ModLogChannel);
			if (repChannel) {
				repChannel.send({ embeds: [embed] });
				interaction.reply({ embeds: [channel.error('moderation/report:SUCCESS', { USER: member.user }, true)] });
			}
		} else {
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Logging: `REPORTS` has not been setup' }, true)] });
		}
	}
}

module.exports = Report;
