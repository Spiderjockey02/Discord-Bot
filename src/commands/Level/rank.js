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
	async run(bot, message) {
		// Get user
		const members = await message.getMember();

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }), { tts: true });

		// Retrieve Rank from databse
		try {
			RankSchema.find({
				guildID: message.guild.id,
			}).sort([
				['user', 'descending'],
			]).exec((err, res) => {
				const user = res.find(doc => doc.userID == members[0].user.id);
				// if they haven't send any messages
				if (!user) {
					msg.delete();
					return message.channel.error('level/rank:NO_MESSAGES');
				}
				let rankScore;
				for (let i = 0; i < res.length; i++) {
					if (res[i].userID == members[0].user.id) rankScore = i;
				}
				// create rank card
				const rankcard = new rank()
					.setAvatar(members[0].user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
					.setCurrentXP(user.Level == 1 ? user.Xp : (user.Xp - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100)))
					.setLevel(user.Level)
					.setRank(rankScore + 1)
					.setRequiredXP((5 * (user.Level ** 2) + 50 * user.Level + 100) - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100))
					.setStatus(members[0].presence.status)
					.setProgressBar(['#FFFFFF', '#DF1414'], 'GRADIENT')
					.setUsername(members[0].user.username)
					.setDiscriminator(members[0].user.discriminator);
				// send rank card
				rankcard.build().then(buffer => {
					const attachment = new MessageAttachment(buffer, 'RankCard.png');
					msg.delete();
					message.channel.send(attachment);
				});

			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
