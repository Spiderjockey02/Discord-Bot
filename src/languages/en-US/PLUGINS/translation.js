const languageData = {
	// SUCCESS
	LANGUAGE_SET: (language) => `Language has been set to \`${language}\`.`,
	LEVEL_SET: (option) => `Level plugin has been set to \`${option}\`.`,
	MODERATION_SET: (option) => `Moderation plugin has been set to \`${option}\`.`,
	MUSIC_SET: (option) => `Music plugin has been set to \`${option}\`.`,
	NSFW_SET: (option) => `NSFW plugin has been set to \`${option}\`.`,
	SEARCH_SET: (option) => `Search plugin has been set to \`${option}\`.`,
	LOGS_SET: (option) => `Logging plugin has been set to \`${option}\`.`,
	LOG_CHANNEL: (channelID) => `Logging channel updated to: <#${channelID}>`,
	// error message
	MISSING_LANGUAGE: 'No language selected.',
	NO_LANGUAGE: 'That is not a language I support, yet. Why not help me learn that language by joining here: https://discord.gg/8g6zUQu',
	// Reaction role messages
	SEND_ROLES: 'Please send a list of roles below (ID\'s or mentions), separate with a space. Type **cancel** to end this.',
	SEND_EMOJIS: 'Please send your emojis below. The order will match with the order of the roles, separate with a space. Type **cancel** to end this',
	EGGLORD_REACTIONS: 'Reaction Roles:',
	REACT_BELOW: (description) => `React below to get a role!\n${description}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if (typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
