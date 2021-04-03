// For better permissions
const permissions = require('../../utils/permissions.json');

// languageData
const languageData = {
	ERROR_MESSAGE: (error) =>`The following error has occurred: \`${error}\`.\nIf this error keeps occurring, please contact support.`,
	INCORRECT_FORMAT: (commandExample) => `Please use the format: \`${commandExample}\`.`,
	MISSING_PERMISSION: (permission) => `I am missing the permission: \`${permissions[permission]}\`.`,
	USER_PERMISSION: (permission) => `You are missing the permission: \`${permissions[permission]}\`.`,
	MISSING_ROLE: 'I was unable to find this role.',
	NO_REASON: 'No reason given.',
	// external files/plugins
	INCORRECT_DELIMITERS: 'Please use one of the following time delimiters: `d`,  `h`,  `m`, `s`.',
	NOT_NUMBER: 'Must be a number.',
	MAX_TIME: 'Can\'t be longer than 10 days.',
	MISSING_CHANNEL: 'I was unable to find this channel.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if (typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
