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
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to view the rank of.',
				type: 'USER',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message) {
		// Get user
		const members = await message.getMember();

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }), { tts: true });

		// Retrieve Rank from databse
		try {
			const res = await this.createRankCard(bot, message.guild, members[0], message.channel);
			msg.delete();
			if (typeof (res) == 'object') {
				await message.channel.send({ files: [res] });
			} else {
				await message.channel.send(res);
			}
		} catch (err) {
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(args.get('user')?.value) ?? interaction.member;

		// Retrieve Rank from databse
		try {
			const res = await this.createRankCard(bot, guild, member, channel);
			if (typeof (res) == 'object') {
				await bot.send(interaction, { files: [res] });
			} else {
				await bot.send(interaction, { content: res });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return bot.send(interaction, { ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}

	// Create the rank card
	async createRankCard(bot, guild, member, channel) {
		const res = await RankSchema.find({ guildID: guild.id }).sort([ ['user', 'descending'] ]);
		const user = res.find(doc => doc.userID == member.user.id);
		// if they haven't send any messages
		if (!user) return channel.error('level/rank:NO_MESSAGES', { ERROR: null }, true);

		let rankScore;
		for (let i = 0; i < res.length; i++) {
			if (res[i].userID == member.user.id) rankScore = i;
		}

		// create rank card
		const rankcard = new rank()
			.setAvatar(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
			.setCurrentXP(user.Level == 1 ? user.Xp : (user.Xp - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100)))
			.setLevel(user.Level)
			.setRank(rankScore + 1)
			.setRequiredXP((5 * (user.Level ** 2) + 50 * user.Level + 100) - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100))
			.setStatus(member.presence.status)
			.setProgressBar(['#FFFFFF', '#DF1414'], 'GRADIENT')
			.setUsername(member.user.username)
			.setDiscriminator(member.user.discriminator);
		if (member.user.rankImage && member.user.premium) rankcard.setBackground('IMAGE', member.user.rankImage);

		// create rank card
		const buffer = await rankcard.build();
		return new MessageAttachment(buffer, 'RankCard.png');
	}
};
