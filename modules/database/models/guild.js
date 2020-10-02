const mongoose = require('mongoose');

const guildScheme = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guildID: Number,
	guildName: String,
	prefix: { type: String, default: '!' },
	// Welcome Plugin
	welcomePlugin: { type: Boolean, default: false },
	// if anti-raid is true and welcome plugin is true both will get activated so this will make sure anti-riad runs first and once 'accepeted' welcome plugn will run
	welcomeRaidConnect: { type: Boolean, default: false },
	welcomeMessageToggle: { type: Boolean, default: false },
	welcomeMessageChannel: { type: Number, default: 999999999999999999 },
	welcomeMessageText: { type: String, default: 'Hello {user}, Welcome to the **{server}**:tada::hugging:!' },
	welcomePrivateToggle: { type: Boolean, default: true },
	welcomePrivateText: { type: String, default: 'Hello {user}, Welcome to the **{server}**:tada::hugging:!' },
	welcomeRoleToggle: { type: Boolean, default: true },
	welcomeRoleGive: { type: Array, default: ['562297641879470082'] },
	welcomeGoodbyeToggle: { type: Boolean, default: true },
	welcomeGoodbyeText: { type: String, default: 'Oh, {user} has just left the **{server}** :slight_frown:.' },
	// Level plugin
	LevelPlugin: { type: Boolean, default: false },
	// 0 = no announcement, 1 = reply, 2 = choosen channel
	LevelOption: { type: Number, default: 1 },
	LevelChannel: { type: Number, default: 999999999999999999 },
	LevelMessage: { type: String, default: 'GG {user}, you have leveled up to {level}' },
	LevelIgnoreRoles: { type: Array, default: ['No-xp'] },
	LevelIgnoreChannel: { type: Array, default: ['No-xp'] },
	LevelMultiplier: { type: Number, default: 1 },
	LevelRoleRewards: { type: Array, default: ['gf'] },
	// Music plugin
	MusicPlugin: { type: Boolean, default: true },
	MusicDJ: { type: Boolean, default: false },
	MusicDJRole: { type: Number, default: 999999999999999999 },
	// Music trivia plugin
	MusicTriviaPlugin: { type: Boolean, default: true },
	MusicTriviaGenres: { type: Array, default: ['pop'] },
	// logging plugin
	ModLog: { type: Boolean, default: false },
	ModLogEvents: { type: Array, default: ['BAN', 'KICK', 'MUTE'] },
	ModLogChannel: { type: Number, default: 752145410033975346 },
	// CommandCooldown
	OnlyCommandChannel: { type: Boolean, default: false },
	CommandChannel: { type: Number, default: 750760429353173112 },
	CommandCooldown: { type: Boolean, default: false },
	CommandCooldownSec: { type: Number, default: 2 },
	// Moderation plugin
	ModerationPlugin: { type: Boolean, default: false },
	ModeratorRoles: { type: Array, default: ['owner'] },
	MutedRole: { type: Number, default: 999999999999999999 },
	// 0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
	// These Channels are ignored
	// These roles are ignored
	ModerationBadwords: { type: Number, default: 1 },
	ModerationBadwordChannel: { type: Array, default: ['Forbadwords'] },
	ModerationBadwordRole: { type: Array, default: ['Forbadwords'] },
	ModerationBadwordList: { type: Array, default: ['IHateGingers'] },
	ModerationRepeatedText: { type: Number, default: 1 },
	ModerationRepeatedTextChannel: { type: Array, default: ['ForRepeatedText'] },
	ModerationRepeatedTextRole: { type: Array, default: ['ForRepeatedText'] },
	ModerationServerInvites: { type: Number, default: 1 },
	ModerationServerInvitesChannel: { type: Array, default: ['ForServerInvites'] },
	ModerationServerInvitesRole: { type: Array, default: ['ForServerInvites'] },
	ModerationExternalLinks: { type: Number, default: 1 },
	ModerationExternalLinksChannel: { type: Array, default: ['ForExternalLinks'] },
	ModerationExternalLinksRole: { type: Array, default: ['ForExternalLinks'] },
	ModerationSpammedCaps: { type: Number, default: 1 },
	ModerationSpammedCapsChannel: { type: Array, default: ['ForSpam'] },
	ModerationSpammedCapsRole: { type: Array, default: ['ForSpam'] },
	ModerationExcessiveEmojis: { type: Number, default: 1 },
	ModerationExcessiveEmojisChannel: { type: Array, default: ['ForEmojis'] },
	ModerationExcessiveEmojisRole: { type: Array, default: ['ForEmojis'] },
	ModerationMassSpoilers: { type: Number, default: 1 },
	ModerationMassSpoilersChannel: { type: Array, default: ['Forspoilers'] },
	ModerationMassSpoilersRole: { type: Array, default: ['Forspoilers'] },
	ModerationMassMention: { type: Number, default: 1 },
	ModerationMassMentionChannel: { type: Array, default: ['ForMentions'] },
	ModerationMassMentionRole: { type: Array, default: ['ForMentions'] },
	ModerationZalgo: { type: Number, default: 1 },
	ModerationZalgoChannel: { type: Array, default: ['ForZalgo'] },
	ModerationZalgoRole: { type: Array, default: ['ForZalgo'] },
	// How many warnings till the user is kicked from server
	ModerationWarningCounter: { type: Number, default: 3 },
	// Anti-raid plugin
	AntiRaidPlugin: { type: Boolean, default: false },
	// 0 = nothing, 1 = verify account by reacting to message, 2 = must complete CAPTCHA to join
	AntiRaidCompletion: { type: Number, default: 1 },
	AntiRaidChannelID: { type: Number, default: 999999999999999999 },
	// Search PLugin
	SearchPlugin: { type: Boolean, default: true },
	// Misc
	DisabledCommands: { type: Array, default: ['junk'] },
	// Server stats plugin
	ServerStats: { type: Boolean, default: false },
	ServerStatsCate: { type: String, default: '📊 Server Stats 📊' },
	ServerStatsBot: { type: Boolean, default: false },
	// channel ID
	ServerStatsBotChannel: { type: Number, default: 999999999999999999 },
	ServerStatsUser: { type: Boolean, default: false },
	// channel ID
	ServerStatsUserChannel: { type: Number, default: 999999999999999999 },
	ServerStatsHuman: { type: Boolean, default: false },
	// channel ID
	ServerStatsHumanChannel: { type: Number, default: 999999999999999999 },
});
module.exports = mongoose.model('Guild', guildScheme);
