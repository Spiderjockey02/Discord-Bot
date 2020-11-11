const languageData = {
	// Miscellenous
	ERROR_MESSAGE: 'An error occured when running this command, please try again or contact support.',
	INCORRECT_FORMAT: (commandExample) => `Please use the format: \`${commandExample}\`.`,
	MISSING_PERMISSION: (permission) => `I am missing the permission: \`${permission}\`.`,
	USER_PERMISSION: (permission) => `You are missing the permission: \`${permission}\`.`,
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
