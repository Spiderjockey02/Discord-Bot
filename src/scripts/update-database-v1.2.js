// Dependencies
const mongoose = require('mongoose'),
	logger = require('../utils/logger'),
	config = require('../config.js'),
	{ GuildSchema } = require('../database/models');

module.exports.run = async () => {
	mongoose.connect(config.MongoDBURl, { useUnifiedTopology: true, useNewUrlParser: true }).then(async () => {
		logger.log('Updating database');
		await GuildSchema.updateMany({ version: '1.1' }, [
			{ $set: { version: '1.2' } },
			{ $unset: [	'ModerationBadwords',
				'ModerationBadwordChannel',
				'ModerationBadwordRole',
				'ModerationBadwordList',
				'ModerationRepeatedText',
				'ModerationRepeatedTextChannel',
				'ModerationRepeatedTextRole',
				'ModerationServerInvites',
				'ModerationServerInvitesChannel',
				'ModerationServerInvitesRole',
				'ModerationExternalLinks',
				'ModerationExternalLinksChannel',
				'ModerationExternalLinksRole',
				'ModerationExternalLinksAllowed',
				'ModerationSpammedCaps',
				'ModerationSpammedCapsChannel',
				'ModerationSpammedCapsRole',
				'ModerationSpammedCapsPercentage',
				'ModerationExcessiveEmojis',
				'ModerationExcessiveEmojisChannel',
				'ModerationExcessiveEmojisRole',
				'ModerationExcessiveEmojiPercentage',
				'ModerationMassSpoilers',
				'ModerationMassSpoilersChannel',
				'ModerationMassSpoilersRole',
				'ModerationMassSpoilersPercentage',
				'ModerationMassMention',
				'ModerationMassMentionChannel',
				'ModerationMassMentionRole',
				'ModerationMassMentionNumber',
				'ModerationZalgo',
				'ModerationZalgoChannel',
				'ModerationZalgoRole',
				'ServerStats',
				'ServerStatsCate',
				'ServerStatsBot',
				'ServerStatsBotChannel',
				'ServerStatsUse',
				'ServerStatsUserChannel',
				'ServerStatsHuman',
				'ServerStatsHumanChannel',
				'DisabledCommands',
				'AntiRaidPlugin',
				'AntiRaidCompletion',
				'AntiRaidChannelID',
				'ReportToggle',
			] }]);
		logger.ready('Database has been updated to v1.2');
	}).catch((err) => {
		console.log(err);
	});
};
