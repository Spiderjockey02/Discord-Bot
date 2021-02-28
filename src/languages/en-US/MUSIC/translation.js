const languageData = {
	// error messages
	NO_QUEUE: 'There are currently no songs playing in this server.',
	NOT_VOICE: 'You\'re not in the same voice channel as me.',
	MISSING_VOICE: 'You\'re not in a voice channel that I can connect to.',
	ERROR: (error) => `There was an error while searching: \`${error}\``,
	LIVESTREAM: 'You can\'t do that to a livestream.',
	MISSING_DJROLE: 'You are missing the DJ role.',
	// incorrect enteries
	LEFT_VOICE: 'I have successfully left the voice channel.',
	NO_ARGS: 'Please enter a song name/url',
	TOO_HIGH: 'Please input a number between 0 and 100.',
	NO_SONG: 'I can\'t find that song.',
	INCORRECT_NUMBER: 'Speed can only be 1 to 10.',
	// pause/resume
	ALREADY_PAUSED: (prefix) => `I am already paused, \`${prefix}resume\` to carry on listening.`,
	ALREADY_RESUMED: (prefix) => `I am already playing, \`${prefix}pause\` to carry on listening.`,
	SUCCESFULL_PAUSE: 'Successfully paused queue',
	SUCCESFULL_RESUME: 'Successfully resuming queue',
	CHANNEL_MOVE: 'I have successfully moved channel.',
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
