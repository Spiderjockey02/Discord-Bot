// The Giveaway messages that are used to display the giveaway content
exports.GiveawayMessages = {};

// The start options for new giveaways
exports.GiveawayStartOptions = {};

// Default giveaway messages
exports.defaultGiveawayMessages = {
	giveaway: '@everyone\n\n🎉🎉 **GIVEAWAY** 🎉🎉',
	giveawayEnded: '@everyone\n\n🎉🎉 **GIVEAWAY ENDED** 🎉🎉',
	inviteToParticipate: 'React with 🎉 to participate!',
	timeRemaining: 'Time remaining: **{duration}**',
	winMessage: 'Congratulations, {winners}! You won **{prize}**!',
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

// The giveaways manager options
exports.GiveawaysManagerOptions = {};

// Defaults options for the GiveawaysManager
exports.defaultManagerOptions = {
	storage: './giveaways.json',
	updateCountdownEvery: 5000,
	default: {
		botsCanWin: false,
		exemptPermissions: [],
		exemptMembers: () => false,
		embedColor: '#FF0000',
		reaction: '🎉',
	},
};

// The reroll method options
exports.GiveawayRerollOptions = {};

// Default reroll options
exports.defaultRerollOptions = {
	winnerCount: null,
	messages: {
		congrat: ':tada: New winner(s) : {winners}! Congratulations!',
		error: 'No valid participations, no winners can be chosen!',
	},
};

// The edit method options
exports.GiveawayEditOptions = {};

// Raw giveaway object (used to store giveaways in the database).
exports.GiveawayData = {};
