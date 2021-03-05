const languageData = {
	NOT_TICKET: 'This is not a ticket channel.',
	TICKET_EXISTS: 'You already have a ticket channel',
	NO_SUPPORT_ROLE: 'No support role has been created on this server yet.',
	NOT_SUPPORT: 'You do not have the correct permissions to close this channel.',
	NO_CATEGORY: 'Please update the category channel ID.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
