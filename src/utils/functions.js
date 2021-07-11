const { GuildSchema, userSchema } = require("../database/models");

module.exports.checkMusic = checkMusic;
module.exports.getGuildData = getGuildData;
module.exports.getUserData = getUserData;

async function checkMusic(member, bot, guildId) {
	const settings = await getGuildData(bot, guildId);

	// Check if the member has role to interact with music plugin
	if (member.guild.roles.cache.get(settings.MusicDJRole)) {
		if (!member.roles.cache.has(settings.MusicDJRole)) {
			return bot.translate('misc:MISSING_ROLE', {}, member.guild.settings.Language);
		}
	}

	// Check that a song is being played
	const player = bot.manager.players.get(member.guild.id);
	if (!player) return bot.translate('misc:NO_QUEUE', {}, member.guild.settings.Language);

	// Check that user is in the same voice channel
	if (member.voice.channel.id !== player.voiceChannel) return bot.translate('misc:NOT_VOICE', {}, member.guild.settings.Language);

	return true;
}
async function getGuildData(bot, guildId) {
	let settings = await GuildSchema.findOne({
		guildID: guildId,
	});

	if (!settings) {
		settings = bot.config.defaultSettings;
		settings.guildID = guildId;
	}
	return settings;
}
async function getUserData(bot, userId) {
	let settings = await userSchema.findOne({
		userID: userId,
	});

	if (!settings) {
		settings = bot.config.defaultUserSettings; /* New Thing to be set in config.js */
		settings.userID = userId;
	}
	return settings;
}
