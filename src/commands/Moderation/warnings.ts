// Dependencies
const { Embed } = require('../../utils'),
	{ WarningSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Warnings command
 * @extends {Command}
*/
class Warnings extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'warnings',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['warns'],
			description: 'Display number of warnings a user has.',
			usage: 'warnings [user]',
			cooldown: 2000,
			examples: ['warnings username'],
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
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Get user
		const members = await message.getMember();

		// get warnings of user
		try {
			const warnings = await 	await WarningSchema.find({
				userID: members[0].id,
				guildID: message.guild.id,
			});

			if (!warnings[0]) {
				// There are no warnings with this user
				message.channel.error('moderation/warnings:NO_WARNINGS');
			} else {
				// Warnings have been found
				let list = `Warnings (${warnings.length}):\n`;
				for (let i = 0; i < warnings.length; i++) {
					list += `${i + 1}.) ${warnings[i].Reason} | ${(message.guild.members.cache.get(warnings[i].Moderater)) ? message.guild.members.cache.get(warnings[i].Moderater) : 'User left'} (Issue date: ${warnings[i].IssueDate})\n`;
				}

				const embed = new Embed(bot, message.guild)
					.setTitle('moderation/warnings:TITLE', { USER: members[0].user.displayName })
					.setDescription(list)
					.setTimestamp();
				message.channel.send({ embeds: [embed] });
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
			channel = guild.channels.cache.get(interaction.channelId);

		// get warnings of user
		try {
			const warnings = await 	await WarningSchema.find({
				userID: member.id,
				guildID: guild.id,
			});

			if (!warnings[0]) {
				// There are no warnings with this user
				interaction.reply({ embeds: [channel.error('moderation/warnings:NO_WARNINGS', { }, true)] });
			} else {
				// Warnings have been found
				let list = `Warnings (${warnings.length}):\n`;
				for (let i = 0; i < warnings.length; i++) {
					list += `${i + 1}.) ${warnings[i].Reason} | ${(guild.members.cache.get(warnings[i].Moderater)) ? guild.members.cache.get(warnings[i].Moderater) : 'User left'} (Issue date: ${warnings[i].IssueDate})\n`;
				}

				const embed = new Embed(bot, guild)
					.setTitle('moderation/warnings:TITLE', { USER: member.user.displayName })
					.setDescription(list)
					.setTimestamp();
				interaction.reply({ embeds: [embed] });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Warnings;
