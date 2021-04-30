// Dependencies
const { MessageAttachment } = require('discord.js'),
	{ RankSchema } = require('../../database/models'),
	{ Rank: rank } = require('canvacord'),
	Command = require('../../structures/Command.js');

module.exports = class Rank extends Command {
	constructor(bot) {
		super(bot, {
			name: 'rank',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lvl', 'level'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
			description: 'Shows your rank/Level.',
			usage: 'level [username]',
			cooldown: 3000,
			examples: ['level userID', 'level @mention', 'level username'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get user
		const member = message.getMember();

		// Check if bot has permission to attach files
		if (!message.channel.permissionsFor(bot.user).has('ATTACH_FILES')) {
			bot.logger.error(`Missing permission: \`ATTACH_FILES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ATTACH_FILES').then(m => m.delete({ timeout: 10000 }));
		}

		// Retrieve Rank from databse
		try {
			await RankSchema.findOne({
				userID: member[0].id,
				guildID: message.guild.id,
			}, (err, Xp) => {
				if (err) {
					if (bot.config.debug) bot.logger.error(`${err.message} - command: rank.`);
					return;
				}
				if (Xp == null) {
					// They haven't sent any messages yet
					message.channel.error(settings.Language, 'LEVEL/NO_MESSAGES');
				} else {
					// Get rank
					RankSchema.find({
						guildID: message.guild.id,
					}).sort([
						['Xp', 'descending'],
					]).exec((err, res) => {
						if (err) console.log(err);
						let rankScore;
						for (let i = 0; i < res.length; i++) {
							if (res[i].userID == member[0].user.id) rankScore = i;
						}
						// create rank card
						const rankcard = new rank()
							.setAvatar(member[0].user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
							.setCurrentXP(Xp.Level == 1 ? Xp.Xp : (Xp.Xp - (5 * ((Xp.Level - 1) ** 2) + 50 * (Xp.Level - 1) + 100)))
							.setLevel(Xp.Level)
							.setRank(rankScore + 1)
							.setRequiredXP((5 * (Xp.Level ** 2) + 50 * Xp.Level + 100) - (5 * ((Xp.Level - 1) ** 2) + 50 * (Xp.Level - 1) + 100))
							.setStatus(member[0].presence.status)
							.setProgressBar(['#FFFFFF', '#DF1414'], 'GRADIENT')
							.setUsername(member[0].user.username)
							.setDiscriminator(member[0].user.discriminator);
						// send rank card
						rankcard.build().then(buffer => {
							const attachment = new MessageAttachment(buffer, 'RankCard.png');
							message.channel.send(attachment);
						});
					});
				}
			});
		} catch (err) {
			bot.logger.error(`${err.message} when running command: rank.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
