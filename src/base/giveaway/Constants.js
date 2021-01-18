exports.defaultGiveawayMessages = {
	giveaway: '@everyone\n\n🎉🎉 **GIVEAWAY** 🎉🎉',
	giveawayEnded: '@everyone\n\n🎉🎉 **GIVEAWAY ENDED** 🎉🎉',
	inviteToParticipate: 'React with 🎉 to participate!',
	timeRemaining: 'Time remaining: **{duration}**',
	winMessage: 'Congratulations, {winners}! You won **{prize}**!\n{messageURL}',
	embedFooter: 'Powered by the discord-giveaways package',
	noWinner: 'Giveaway cancelled, no valid participations.',
	winners: 'winner(s)',
	endedAt: 'End at',
	hostedBy: 'Hosted by: {user}',
	units: {
		seconds: 'seconds',
		minutes: 'minutes',
		hours: 'hours',
		days: 'days',
		pluralS: false,
	},
};

exports.defaultManagerOptions = {
	storage: './giveaways.json',
	updateCountdownEvery: 5000,
	endedGiveawaysLifetime: 0,
	hasGuildMemberIntent: false,
	default: {
		botsCanWin: false,
		exemptPermissions: [],
		exemptMembers: () => false,
		embedColor: '#FF0000',
		reaction: '🎉',
	},
};

exports.defaultRerollOptions = {
	winnerCount: null,
	messages: {
		congrat: ':tada: New winner(s) : {winners}! Congratulations!\n{messageURL}',
		error: 'No valid participations, no winners can be chosen!',
	},
};
