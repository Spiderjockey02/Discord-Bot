const languageData = {
	// Miscellenous
	ERROR_MESSAGE: 'An error occured when running this command, please try again or contact support.',
	INCORRECT_FORMAT: (res) => `Please use the format: \`${res}\`.`,
	MISSING_PERMISSION: (res) => `I am missing the permission: \`${res}\`.`,
	USER_PERMISSION: (res) => `You are missing the permission: \`${res}\`.`,
	MISSING_ROLE: 'I was unable to find this role.',
	NO_REASON: 'No reason given.',
	// Level
	// Misc
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
