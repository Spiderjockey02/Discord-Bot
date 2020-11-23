const languageData = {
	NO_QUEUE: 'There are currently no songs playing in this server.',
	NOT_VOICE: 'You\'re not in the same voice channel as me.',
	MISSING_VOICE: 'You\'re not in a voice channel that I can connect to.',
	LEFT_VOICE: 'I have successfully left the voice channel.',
	NO_ARGS: 'Please enter a song name/url',

	ALREADY_PAUSED: (prefix) => `I am already paused, \`${prefix}resume\` to carry on listening.`,
	ALREADY_RESUMED: (prefix) => `I am already playing, \`${prefix}pause\` to carry on listening.`,
	SUCCESFULL_PAUSE: 'Successfully paused queue',

	SUCCESFULL_RESUME: 'Successfully resuming queue',
	NO_SONG: 'I can\'t find that song.',

	ERROR: (error) => `There was an error while searching: \`${error}\``,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
