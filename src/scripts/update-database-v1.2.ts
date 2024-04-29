// Dependencies
const	{ logger } = require('../utils'),
	{ GuildSchema } = require('../database/models');

module.exports.run = async () => {
	logger.log('Updating database');
	try {
		const resp = await GuildSchema.updateMany({ version: '1.1' }, [
			{ $set: { version: '1.2', MutedMembers: [] } },
			{ $unset: [	'ModerationBadwords', 'ModerationBadwordChannel', 'ModerationBadwordRole', 'ModerationBadwordList',
				'ModerationRepeatedText', 'ModerationRepeatedTextChannel', 'ModerationRepeatedTextRole', 'ModerationServerInvites',
				'ModerationServerInvitesChannel', 'ModerationServerInvitesRole', 'ModerationExternalLinks', 'ModerationExternalLinksChannel',
				'ModerationExternalLinksRole', 'ModerationExternalLinksAllowed', 'ModerationSpammedCaps', 'ModerationSpammedCapsChannel',
				'ModerationSpammedCapsRole', 'ModerationSpammedCapsPercentage', 'ModerationExcessiveEmojis', 'ModerationExcessiveEmojisChannel',
				'ModerationExcessiveEmojisRole', 'ModerationExcessiveEmojiPercentage', 'ModerationMassSpoilers', 'ModerationMassSpoilersChannel',
				'ModerationMassSpoilersRole', 'ModerationMassSpoilersPercentage', 'ModerationMassMention', 'ModerationMassMentionChannel',
				'ModerationMassMentionRole', 'ModerationMassMentionNumber', 'ModerationZalgo', 'ModerationZalgoChannel', 'ModerationZalgoRole',
				'ServerStats', 'ServerStatsCate', 'ServerStatsBot', 'ServerStatsBotChannel', 'ServerStatsUse', 'ServerStatsUserChannel',
				'ServerStatsHuman', 'ServerStatsHumanChannel', 'DisabledCommands', 'AntiRaidPlugin', 'AntiRaidCompletion', 'AntiRaidChannelID',
				'ReportToggle', 'CommandChannelToggle', 'CommandChannels', 'CommandCooldown', 'CommandCooldownSec', 'MusicTriviaPlugin',
				'MusicTriviaGenres',
			] }]);
		logger.ready('Database has been updated to v1.2');
		return resp;
	} catch (err) {
		console.log(err);
	}
};
