// This contains language files for the commands
const languageData = {
	SUCCESS_GIVEAWAY: (action) => `Success! Giveaway ${action}!`,
	UNKNOWN_GIVEAWAY: (message) => `No giveaway found with Message ID: \`${message}\`, please check and try again.`,
	EDIT_GIVEAWAY: (time) => `Success! Giveaway will updated in less than ${time} seconds.`,
	INCORRECT_WINNER_COUNT: '     .',
	//
	GIVEAWAY_DATA: {
		giveaway: '** **',
		giveawayEnded: '**   **',
		timeRemaining: '  : **{duration}**!',
		inviteToParticipat: '        ',
		winMessage: 'Congratulations, {winners}! You won **{prize}**!\n{messageURL}',
		noWinner: '        .',
		hostedBy: ': {user}',
		winners: '()'
		endedAt: ' ',
		units: {
			seconds: '',
			minutes: '',
			hours: '',
			days: '',
		},
	},
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
