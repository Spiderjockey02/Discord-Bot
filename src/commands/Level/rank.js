// Dependencies
const { MessageAttachment } = require('discord.js'),
	{ Ranks } = require('../../modules/database/models/index'),
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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get user
		const member = message.guild.getMember(message, args);

		// Retrieve Rank from databse
		try {
			await Ranks.findOne({
				userID: member[0].id,
				guildID: message.guild.id,
			}, (err, Xp) => {
				if (err) {
					if (bot.config.debug) bot.logger.error(`${err.message} - command: rank.`);
					return;
				}
				if (Xp == null) {
					// They haven't sent any messages yet
					message.error(settings.Language, 'LEVEL/NO_MESSAGES');
				} else {
					// Get rank
					Ranks.find({
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
							.setCurrentXP(Xp.Xp)
							.setLevel(Xp.Level)
							.setRank(rankScore + 1)
							.setRequiredXP((5 * (Xp.Level ** 2) + 50 * Xp.Level + 100))
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
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
