// Dependencies
const { Embed } = require('../../utils'),
	{ WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Warnings extends Command {
	constructor(bot) {
		super(bot, {
			name: 'warnings',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['warns'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Display number of warnings a user has.',
			usage: 'warnings [user]',
			cooldown: 2000,
			examples: ['warnings username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to view the warnings of.',
				type: 'USER',
				required: true,
			}],
			defaultPermission: false,
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Get user
		const members = await message.getMember();

		// get warnings of user
		try {
			await WarningSchema.find({
				userID: members[0].id,
				guildID: message.guild.id,
			}, (err, warn) => {
				// if an error occured
				if (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}

				if (!warn[0]) {
					// There are no warnings with this user
					message.channel.send(bot.translate('moderation/warnings:NO_WARNINGS')).then(m => m.timedDelete({ timeout: 3500 }));
				} else {
					// Warnings have been found
					let list = `Warnings (${warn.length}):\n`;
					for (let i = 0; i < warn.length; i++) {
						list += `${i + 1}.) ${warn[i].Reason} | ${(message.guild.members.cache.get(warn[i].Moderater)) ? message.guild.members.cache.get(warn[i].Moderater) : 'User left'} (Issue date: ${warn[i].IssueDate})\n`;
					}

					const embed = new Embed(bot, message.guild)
						.setTitle('moderation/warns:TITLE', { USER: members[0].user.username })
						.setDescription(list)
						.setTimestamp();
					message.channel.send(embed);
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for message command
	async callback(bot, interaction, guild, args) {
		// Get user
		const member = guild.members.cache.get(args.get('user').value);
		const channel = guild.channels.cache.get(interaction.channelID);

		try {
			await WarningSchema.find({
				userID: member.id,
				guildID: guild.id,
			}, (err, warn) => {
				// if an error occured
				if (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
				}

				if (!warn[0]) {
					// There are no warnings with this user
					bot.send(interaction, bot.translate('moderation:warnings/NO_WARNINGS'), guild.settings.ModerationClearToggle);
				} else {
					// Warnings have been found
					let list = `Warnings (${warn.length}):\n`;
					for (let i = 0; i < warn.length; i++) {
						list += `${i + 1}.) ${warn[i].Reason} | ${(guild.members.cache.get(warn[i].Moderater)) ? guild.members.cache.get(warn[i].Moderater) : 'User left'} (Issue date: ${warn[i].IssueDate})\n`;
					}

					const embed = new Embed(bot, guild)
						.setTitle('moderation/warns:TITLE', { USER: member.user.username })
						.setDescription(list)
						.setTimestamp();
					bot.send(interaction, embed, guild.settings.ModerationClearToggle);
				}
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
