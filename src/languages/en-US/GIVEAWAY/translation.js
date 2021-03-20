// This contains language files for the commands
const languageData = {
	SUCCESS_GIVEAWAY: (action) => `Success! Giveaway ${action}!`,
	UNKNOWN_GIVEAWAY: (message) => `No giveaway found with Message ID: \`${message}\`, please check and try again.`,
	EDIT_GIVEAWAY: (time) => `Success! Giveaway will updated in less than ${time} seconds.`,
	INCORRECT_WINNER_COUNT: 'Winner count must be less than 10.',
	//
	GIVEAWAY_DATA: {
		giveaway: '🎉\t**GIVEAWAY**\t🎉',
		giveawayEnded: '🎉\t**GIVEAWAY ENDED**\t🎉',
		timeRemaining: 'Time remaining: **{duration}**!',
		inviteToParticipate: 'React with 🎉 to participate!',
		winMessage: 'Congratulations, {winners}! You won **{prize}**!\n{messageURL}',
		noWinner: 'Giveaway cancelled, no valid participations or not enough winners.',
		hostedBy: 'Hosted by: {user}',
		winners: 'winner(s)',
		endedAt: 'Ended at',
		units: {
			seconds: 'seconds',
			minutes: 'minutes',
			hours: 'hours',
			days: 'days',
		},
	},
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
