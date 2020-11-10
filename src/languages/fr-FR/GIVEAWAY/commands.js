// This contains language files for the commands
const languageData = {
	SUCCESS_GIVEAWAY: (r) => `Success! Giveaway ${r}!`,
	UNKNOWN_GIVEAWAY: (r) => `No giveaway found for ${r}, please check and try again.`,
	EDIT_GIVEAWAY: (r) => `Success! Giveaway will updated in less than ${(r)} seconds.`,
	INCORRECT_WINNER_COUNT: 'Winner count must be a number.',
	AVATAR_TITLE: (r) => `Avatar for ${r[0]}#${r[1]}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
