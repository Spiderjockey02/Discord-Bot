const languageData = {
	// Misc
	TOO_POWERFUL: 'I am unable to ban this user due to their power.',
	SELF_PUNISHMENT: 'You can\'t punish yourself.',
	NOT_INVOICE: (user) => `${user} is not in a voice channel.`,
	REASON: (reason) => `**Reason:** ${reason}`,

	// successfull moderation
	SUCCESSFULL_BAN: (user) => `*${user} was successfully banned*.`,
	SUCCESSFULL_DEAFEN: (user) => `*${user} was successfully deafened*.`,
	SUCCESSFULL_MUTE: (user) => `*${user} was successfully muted*.`,
	SUCCESSFULL_KICK: (user) => `*${user} was successfully kicked*.`,
	SUCCESSFULL_NICK: (user) => `*Successfully changed nickname of ${user}.*`,
	SUCCESSFULL_SLOWMODE: (time) => `Slowmode Set to **${time}**.`,
	SUCCESSFULL_UNBAN: (user) => `*${user} was successfully unbanned*.`,
	SUCCESSFULL_UNMUTE: (user) => `*${user} was successfully unmuted*.`,
	SUCCESSFULL_UNDEAFEN: (user) => `*${user} was successfully undeafened*.`,
	SUCCESSFULL_REPORT: (user) => `*${user} has been successfully reported*.`,
	SUCCESSFULL_WARN: (user) => `${user} has been warned`,
	SUCCESSFULL_KWARNS: (user) => `*${user} was successfully kicked for having too many warnings*.`,
	// WARNINGS
	CLEARED_WARNINGS: (user) => `Warnings for ${user} has been cleared.`,
	NO_WARNINGS: 'This user has not been warned before.',
	WARNS_TITLE: (user) => `${user}'s warning list.`,
	// CLEAR MESSAGES
	MESSAGES_DELETED: (messages) => `${messages} messages were successfully deleted.`,
	// NICKNAME
	ENTER_NICKNAME: 'Please enter a nickname.',
	LONG_NICKNAME: 'Nickname must be shorter than 32 characters.',
	UNSUCCESSFULL_NICK: (user) => ` I am unable to change ${user} nickname.`,
	UNABLE_NICKNAME: 'I am unable to change that user\'s nickname due to their power.',
	// REPORT COMMAND
	REPORT_AUTHOR: '~Member Reported~',
	REPORT_MEMBER: 'Member:',
	REPORT_BY: 'Reported by:',
	REPORT_IN: 'Reported in:',
	REPORT_REASON: 'Reason:',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
