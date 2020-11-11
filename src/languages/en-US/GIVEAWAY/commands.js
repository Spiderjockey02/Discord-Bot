// This contains language files for the commands
const languageData = {
	SUCCESS_GIVEAWAY: (action) => `Success! Giveaway ${action}!`,
	UNKNOWN_GIVEAWAY: (message) => `No giveaway found with Message ID: \`${message}\`, please check and try again.`,
	EDIT_GIVEAWAY: (time) => `Success! Giveaway will updated in less than ${time} seconds.`,
	INCORRECT_WINNER_COUNT: 'Winner count must be a number.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
