const mongoose = require('mongoose')

const guildScheme = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildID: String,
  guildName: String,
  prefix: { type: String, default: '!' },
  //Welcome Plugin
  welcomePlugin: { type: Boolean, default: true },
  welcomeChannel: { type: Number, default: 100000000000000000 },
  welcomeMessage: { type: String, default: 'Hello {user}, Welcome to the **{server}**:tada::hugging:!' },
  welcomePvt: { type: Boolean, default: true },
  welcomePvtMessage: { type: String, default: 'Hello {user}, Welcome to the **{server}**:tada::hugging:!' },
  welcomeRole: { type: Boolean, default: true },
  welcomeRoleGive: { type: Array, default: ["users"] },
  welcomeGoodbye: { type: Boolean, default: true },
  welcomeGoodbyeMessage: { type: String, default: 'Oh, {user} has just left the **{server}** :slight_frown:.' },
  //Level plugin
  LevelPlugin: { type: Boolean, default: false },
  LevelOption: {type: Number, default: 1}, //0 = no announcement, 1 = reply, 2 = choosen channel, 3 = in DM's
  LevelChannel: {type: Number, default: 100000000000000000 },
  LevelMessage: { type: String, default: 'GG {user}, you have leveled up to {level}' },
  LevelIgnoreRoles: { type: Array, default: ['No-xp'] },
  LevelIgnoreChannel: { type: Array, default: ['No-xp'] },
  LevelMultiplier: { type: Number, default: 1 }, //Range 0 to 3
  LevelRoleRewards: { type: Array, default: ['gf'] },
  //Music plugin
  MusicPlugin: { type: Boolean, default: true },
  MusicDJ: { type: Boolean, default: false },
  MusicDJRole: { type: Number, default: 100000000000000000 },
  //Music trivia plugin
  MusicTriviaPlugin: { type: Boolean, default: true },
  MusicTriviaGenres: { type: Array, default: ['pop'] },
  //logging plugin
  ModLog: { type: Boolean, default: true },
  ModLogEvents: { type: Array, default: ['BAN', 'KICK', 'MUTE'] },
  ModLogChannel: { type: Number, default: 100000000000000000 },
  //CommandCooldown
  OnlyCommandChannel: { type: Boolean, default: false },
  CommandChannel: { type: Number, default: 100000000000000000 },
  CommandCooldown: { type: Boolean, default: false },
  CommandCooldownSec: { type: Number, default: 2 },
  //Moderation plugin
  ModerationPlugin: { type: Boolean, default: true },
  ModeratorRoles: { type: Array, default: ['owner'] },
  MutedRole: { type: String, default: 'Muted' },
  ModerationBadwords: { type: Number, default: 1}, //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationBadwordChannel: { type: Array, default: ['Forbadwords'] }, //These Channels are ignored
  ModerationBadwordRole: { type: Array, default: ['Forbadwords'] },  //These roles are ignored
  ModerationBadwordList: { type: Array, default: ['IHateGingers'] },
  ModerationRepeatedText: { type: Number, default: 1 }, //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationRepeatedTextChannel: { type: Array, default: ['ForRepeatedText'] }, //These Channels are ignored
  ModerationRepeatedTextRole: { type: Array, default: ['ForRepeatedText'] },  //These roles are ignored
  ModerationServerInvites: { type: Number, default: 1 },  //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationServerInvitesChannel: { type: Array, default: ['ForServerInvites'] }, //These Channels are ignored
  ModerationServerInvitesRole: { type: Array, default: ['ForServerInvites'] },  //These roles are ignored
  ModerationExternalLinks: { type: Number, default: 1 },  //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationExternalLinksChannel: { type: Array, default: ['ForExternalLinks'] }, //These Channels are ignored
  ModerationExternalLinksRole: { type: Array, default: ['ForExternalLinks'] },  //These roles are ignored
  ModerationSpammedCaps: { type: Number, default: 1 },  //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationSpammedCapsChannel: { type: Array, default: ['ForSpam'] }, //These Channels are ignored
  ModerationSpammedCapsRole: { type: Array, default: ['ForSpam'] },  //These roles are ignored
  ModerationExcessiveEmojis: { type: Number, default: 1 },  //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationExcessiveEmojisChannel: { type: Array, default: ['ForEmojis'] }, //These Channels are ignored
  ModerationExcessiveEmojisRole: { type: Array, default: ['ForEmojis'] },  //These roles are ignored
  ModerationMassSpoilers: { type: Number, default: 1 }, //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationMassSpoilersChannel: { type: Array, default: ['Forspoilers'] }, //These Channels are ignored
  ModerationMassSpoilersRole: { type: Array, default: ['Forspoilers'] },  //These roles are ignored
  ModerationMassMention: { type: Number, default: 1 },  //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationMassMentionChannel: { type: Array, default: ['ForMentions'] }, //These Channels are ignored
  ModerationMassMentionRole: { type: Array, default: ['ForMentions'] },  //These roles are ignored
  ModerationZalgo: { type: Number, default: 1 },  //0 = disabled, 1 = delete message, 2 = warn member, 3 = delete message and warn member
  ModerationZalgoChannel: { type: Array, default: ['ForZalgo'] },  //These channels are ignored
  ModerationZalgoRole: { type: Array, default: ['ForZalgo'] },  //These roles are ignored
  //Anti-raid plugin
  AntiRaidPlugin: { type: Boolean, default: false },
  AntiRaidCompletion: {type: Number, default: 1 },  //0 = nothing, 1 = verify account by reacting to message, 2 = must complete CAPTCHA to join
  //Search PLugin
  SearchPlugin: { type: Boolean, default: true },
  //Misc
  DisabledCommands: { type: Array, default: ["junk"] },
  //Server stats plugin
  ServerStats: { type: Boolean, default: false},
  ServerStatsCate: { type: String, default: "📊 Server Stats 📊" },
  ServerStatsBot: { type: Boolean, default: false },
  ServerStatsBotChannel: { type: Number, default: 100000000000000000 },  //Channel ID
  ServerStatsUser: { type: Boolean, default: false },
  ServerStatsUserChannel: { type: Number, default: 100000000000000000 }, //Channel ID
  ServerStatsHuman: { type: Boolean, default: false },
  ServerStatsHumanChannel: { type: Number, default: 100000000000000000 } //Channel ID
});
module.exports = mongoose.model('Guild', guildScheme)
