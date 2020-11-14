// Dependencies
const { MessageAttachment } = require('discord.js');
const { Ranks } = require('../../modules/database/models/index');
const { Rank } = require('canvacord');

module.exports.run = async (bot, message, args, settings) => {
	// check to make sure Level plugin is enabled
	if (settings.LevelPlugin == false) return;
	// Get user
	const member = bot.getUsers(message, args);
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
					const rank = new Rank()
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
					rank.build().then(buffer => {
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
};

module.exports.config = {
	command: 'rank',
	aliases: ['lvl', 'level'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Level',
	category: 'Level',
	description: 'Shows your rank/Level.',
	usage: '${PREFIX}level [username]',
};
