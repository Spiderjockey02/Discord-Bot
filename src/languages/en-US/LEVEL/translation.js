const languageData = {
	LEADERBOARD_TITLE: 'Leaderboard',
	LEADERBOARD_FIELDT: 'No data found',
	LEADERBOARD_FIELDDESC: 'Please type in chat to gain experience.',
	NO_MESSAGES: 'You aren\'t ranked yet. Send some messages first, then try again.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
