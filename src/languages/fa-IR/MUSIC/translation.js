const languageData = {
	// error messages
	NO_QUEUE: '          .',
	NOT_VOICE: '       .',
	MISSING_VOICE: '          .',
	ERROR: (error) => `There was an error while searching: \`${error}\``,
	// incorrect enteries
	LEFT_VOICE: '       .',
	NO_ARGS: '  /      ',
	TOO_HIGH: '    0  100  .',
	NO_SONG: '       .',
	// pause/resume
	ALREADY_PAUSED: (prefix) => `I am already paused, \`${prefix}resume\` to carry on listening.`,
	ALREADY_RESUMED: (prefix) => `I am already playing, \`${prefix}pause\` to carry on listening.`,
	SUCCESFULL_PAUSE: '   ',
	SUCCESFULL_RESUME: '  ',
	CHANNEL_MOVE: '      .',
	TIME_MOVED: (time) => `Time moved to: \`${time}\`.`,

	SOUND_CURRENT: (volume) => `🔊 The current volume is: **${volume}%**.`,
	SOUND_SET: (volume) => `🔊 Player sound set to **${volume}%**.`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
