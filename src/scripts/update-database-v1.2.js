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
				badwords: {

				}
			} } },
			{ $unset: [	ModerationBadwords: ,
      	ModerationBadwordChannel: ,
      	ModerationBadwordRole: ,
      	ModerationBadwordList: ,
      	ModerationRepeatedText: ,
      	ModerationRepeatedTextChannel: ,
      	ModerationRepeatedTextRole:,
      	ModerationServerInvites: ,
      	ModerationServerInvitesChannel: ,
      	ModerationServerInvitesRole: ,
      	ModerationExternalLinks: ,
      	ModerationExternalLinksChannel: ,
      	ModerationExternalLinksRole: ,
      	ModerationExternalLinksAllowed: ,
      	ModerationSpammedCaps: { type: Number, default: 0 },
      	ModerationSpammedCapsChannel: { type: Array, default: ['ForSpam'] },
      	ModerationSpammedCapsRole: { type: Array, default: ['ForSpam'] },
      	ModerationSpammedCapsPercentage: { type: Number, default: 60 },
      	ModerationExcessiveEmojis: { type: Number, default: 0 },
      	ModerationExcessiveEmojisChannel: { type: Array, default: ['ForEmojis'] },
      	ModerationExcessiveEmojisRole: { type: Array, default: ['ForEmojis'] },
      	ModerationExcessiveEmojiPercentage: { type: Number, default: 60 },
      	ModerationMassSpoilers: { type: Number, default: 0 },
      	ModerationMassSpoilersChannel: { type: Array, default: ['Forspoilers'] },
      	ModerationMassSpoilersRole: { type: Array, default: ['Forspoilers'] },
      	ModerationMassSpoilersPercentage: { type: Number, default: 60 },
      	ModerationMassMention: { type: Number, default: 0 },
      	ModerationMassMentionChannel: { type: Array, default: ['ForMentions'] },
      	ModerationMassMentionRole: { type: Array, default: ['ForMentions'] },
      	ModerationMassMentionNumber: { type: Number, default: 5 },
      	ModerationZalgo: { type: Number, default: 0 },
      	ModerationZalgoChannel: { type: Array, default: ['ForZalgo'] },
      	ModerationZalgoRole: { type: Array, default: ['ForZalgo'] },] },
		]);
		logger.ready('Database has been updated to v1.1');
	}).catch((err) => {
		console.log(err);
	});
};
