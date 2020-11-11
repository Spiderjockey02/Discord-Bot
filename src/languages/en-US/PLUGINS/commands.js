const languageData = {
	MISSING_LANGUAGE: 'No language selected.',
	LANGUAGE_SET: (language) => `Language has been set to \`${language}\`.`,
	NO_LANGUAGE: 'That is not a language I support, yet. Why not help me learn that language by joining here: https://discord.gg/8g6zUQu',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
