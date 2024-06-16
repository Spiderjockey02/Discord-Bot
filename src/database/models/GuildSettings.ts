import { Schema, model } from 'mongoose';
import defaultSettings from '../../assets/json/defaultGuildSettings.json';

const guildSchema = new Schema({
	guildID: String,
	guildName: String,
	prefix: { type: String, default: defaultSettings.prefix },
	// Welcome Plugin
	welcomePlugin: { type: Boolean, default: false },
	// if anti-raid is true and welcome plugin is true clienth will get activated so this will make sure anti-riad runs first and once 'accepeted' welcome plugn will run
	welcomeRaidConnect: { type: Boolean, default: false },
	welcomeMessageToggle: { type: Boolean, default: false },
	welcomeMessageChannel: { type: String },
	welcomeMessageText: { type: String, default: 'Hello {user}, Welcome to **{server}**!' },
	welcomePrivateToggle: { type: Boolean, default: false },
	welcomePrivateText: { type: String, default: 'Have a great time here in **{server}**.' },
	welcomeRoleToggle: { type: Boolean, default: false },
	welcomeRoleGive: { type: Array },
	welcomeGoodbyeToggle: { type: Boolean, default: false },
	welcomeGoodbyeText: { type: String, default: '**{user}** just left the server.' },
	// 0 = no announcement, 1 = reply, 2 = choosen channel
	LevelOption: { type: Number, default: 1 },
	LevelChannel: { type: String },
	LevelMessage: { type: String, default: 'GG {user}, you have leveled up to {level}!' },
	LevelIgnoreRoles: { type: Array },
	LevelIgnoreChannel: { type: Array },
	LevelMultiplier: { type: Number, default: 1 },
	LevelRoleRewards: { type: Array },
	// Music plugin
	MusicDJ: { type: Boolean, default: false },
	MusicDJRole: { type: String },
	// logging plugin
	ModLog: { type: Boolean, default: false },
	ModLogEvents: { type: Array },
	ModLogChannel: { type: String },
	ModLogIgnoreBot: { type: Boolean, default: true },
	ModLogIgnoreChannel: { type: Array },
	// CommandCooldown
	// Tag plugin
	PrefixTags: { type: Boolean, default: false },
	// Moderation plugin
	ModeratorRoles: { type: Array },
	// How many warnings till the user is kicked from server
	ModerationWarningCounter: { type: Number, default: 3 },
	// If moderation commands should be deleted after.
	ModerationClearToggle: { type: Boolean, default: true },
	// If every bot's should be affected by auto-mod
	ModerationIgnoreBotToggle: { type: Boolean, default: true },
	// For ticket command
	TicketToggle: { type: Boolean, default: true },
	TicketSupportRole: { type: String },
	TicketCategory: { type: String },
	// language
	Language: { type: String, default: 'en-US' },
	plugins: { type: Array, default: ['Fun', 'Giveaway', 'Guild', 'Image', 'Misc', 'Moderation', 'Music', 'NSFW', 'Plugins', 'Searcher', 'Ticket'] },
	version: { type: Number, default: '1.2' },
});

export default model('Guild', guildSchema);
