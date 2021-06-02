// Dependecies
const mongoose = require('mongoose'),
	logger = require('../utils/logger'),
	config = require('../config.js'),
	{ Guild } = require('../modules/database/models');

module.exports = async () => {
	mongoose.connect(config.MongoDBURl, { useUnifiedTopology: true, useNewUrlParser: true }).then(async () => {
		logger.log('Updating database');
		await Guild.updateMany({ version: '1.1' }, [
			{ $set: { automoderation: {
				enabled: false,
				badwords: {
					enabled: false,
					word: [],
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
				ServerInvites: {
					enabled: false,
					Invites: [],
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
				ExternalLinks: {
					enabled: false,
					URLs: [],
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
				SpammedCaps: {
					enabled: false,
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
				ExcessiveEmojis: {
					enabled: false,
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
				MassMention: {
					enabled: false,
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
				Attachments: {
					enabled: false,
					limit: 5,
					channels: [],
					roles: [],
					punishmentLevel: 1,
				},
			} } },
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
			] }]);
		logger.ready('Database has been updated to v1.1');
	}).catch((err) => {
		console.log(err);
	});
};
