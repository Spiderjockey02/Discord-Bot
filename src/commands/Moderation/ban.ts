// Dependencies
const { Embed, time: { getTotalTime } } = require('../../utils'),
	{ timeEventSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Ban command
 * @extends {Command}
*/
export default class Ban extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'ban',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: [Flags.BanMembers],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.BanMembers],
			description: 'Ban a user.',
			usage: 'ban <user> [reason] [time]',
			cooldown: 5000,
			examples: ['ban username spamming chat 4d', 'ban username raiding'],
			slash: true,
			options: [
				{
					name: 'user',
					description: 'The user to ban.',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason for the ban.',
					type: ApplicationCommandOptionType.String,
					required: false,
				},
				{
					name: 'time',
					description: 'The time till they are unbanned.',
					type: ApplicationCommandOptionType.String,
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

		// Get user and reason
		const reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER');

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH');

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (members[0].permissions.has(Flags.Administrator) || members[0].roles.highest.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			return message.channel.error('moderation/ban:TOO_POWERFUL');
		}

		// Ban user with reason and check if timed ban
		try {
			// send DM to user
			try {
				const embed = new Embed(client, message.guild)
					.setTitle('moderation/ban:TITLE')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('moderation/ban:DESC', { NAME: message.guild.name }))
					.addFields(
						{ name: message.translate('moderation/ban:BAN_BY'), value: message.author.displayName, inline: true },
						{ name: message.translate('misc:REASON'), value: reason, inline: true },
					);
				await members[0].send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// Ban user from guild
			await members[0].ban({ reason: reason });
			message.channel.success('moderation/ban:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 8000 }));

			// Check to see if this ban is a tempban
			const possibleTime = message.args[message.args.length - 1];
			if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
				const { error, success: time } = getTotalTime(possibleTime);
				if (error) return message.channel.error(error);

				// connect to database
				const newEvent = new timeEventSchema({
					userID: members[0].user.id,
					guildID: message.guild.id,
					time: new Date(new Date().getTime() + time),
					channelID: message.channel.id,
					type: 'ban',
				});
				await newEvent.save();

				// unban user
				setTimeout(async () => {
					message.args[0] = members[0].user.id;
					await client.commands.get('unban').run(client, message, settings);

					// Delete item from database as client didn't crash
					await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
						if (err) console.log(err);
					});
				}, time);
			}
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
			reason = args.get('reason')?.value;

		// Make sure user isn't trying to punish themselves
		if (member.user.id == interaction.user.id) return interaction.reply({ embeds: [channel.error('misc:SELF_PUNISH', {}, true)], ephermal: true });

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (member.permissions.has(Flags.Administrator) || member.roles.highest.comparePositionTo(guild.members.me.roles.highest) >= 0) {
			return interaction.reply({ embeds: [channel.error('moderation/ban:TOO_POWERFUL', {}, true)], ephermal: true });
		}

		// Ban user with reason and check if timed ban
		try {
			// send DM to user
			try {
				const embed = new Embed(client, guild)
					.setTitle('moderation/ban:TITLE')
					.setColor(15158332)
					.setThumbnail(guild.iconURL())
					.setDescription(guild.translate('moderation/ban:DESC', { NAME: guild.name }))
					.addFields(
						{ name: guild.translate('moderation/ban:BAN_BY'), value: interaction.user.displayName, inline: true },
						{ name: guild.translate('misc:REASON'), value: reason, inline: true },
					);
				await member.send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// Ban user from guild
			await member.ban({ reason: reason });
			interaction.reply({ embeds: [channel.success('moderation/ban:SUCCESS', { USER: member.user }, true)], fetchReply:true }).then(m => m.timedDelete({ timeout: 8000 }));

			// Check to see if this ban is a tempban
			const possibleTime = args.get('time')?.value;
			if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
				const { error, success: time } = getTotalTime(possibleTime);
				if (error) return interaction.reply({ embeds: [channel.error(error, null, true)], ephermal: true });

				// connect to database
				const newEvent = new timeEventSchema({
					userID: member.user.id,
					guildID: guild.id,
					time: new Date(new Date().getTime() + time),
					channelID: channel.id,
					type: 'ban',
				});
				await newEvent.save();

				// unban user
				setTimeout(async () => {
					await guild.members.unban(member.user);

					// Delete item from database as client didn't crash
					await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
						if (err) console.log(err);
					});
				}, time);
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

