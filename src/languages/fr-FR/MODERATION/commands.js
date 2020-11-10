const languageData = {
	TOO_POWERFUL: 'I am unable to ban this user due to their power.',
	SELF_PUNISHMENT: 'You can\'t punish yourself.',
	SUCCESSFULL_BAN: (r) => `*${r[0]}#${r[1]} was successfully banned*.`,
	CLEARED_WARNINGS: (user) => `Warnings for ${user} has been cleared.`,
	NO_WARNINGS: 'This user has not been warned before.',
	MESSAGES_DELETED: (messages) => `${messages} messages were successfully deleted.`,
	SUCCESSFUL_DEAFEN: (user) => `*${user.user.username}#${user.user.discriminator} was successfully deafened*.`,
	NOT_INVOICE: (user) => `${user} is not in a voice channel.`,
	SUCCESSFULL_KICK: (r) => `*${r[0]}#${r[1]} was successfully kicked*.`,
	SUCCESSFULL_MUTE: (r) => `*${r[0]}#${r[1]} was successfully muted*.`,
	ENTER_NICKNAME: 'Please enter a nickname.',
	LONG_NICKNAME: 'Nickname must be shorter than 32 characters.',
	SUCCESSFUL_NICK: (user) => `*Successfully changed nickname of ${user[0]}#${user[1]}.*`,
	UNSUCCESSFULL_NICK: (user) => ` I am unable to change ${user[0]}#${user[0]} nickname.`,
	REPORT_AUTHOR: '~Member Reported~',
	REPORT_MEMBER: 'Member:',
	REPORT_BY: 'Reported by:',
	REPORT_IN: 'Reported in:',
	REPORT_REASON: 'Reason:',
	SUCCESSFULL_SLOWMODE: (time) => `Slowmode Set to **${time}**.`,
	SUCCESSFULL_UNBAN: (user) => `*${user[0]}#${user[1]} was successfully unbanned*.`,
	SUCCESSFUL_UNDEAFEN: (user) => `*${user[0]}#${user[1]} was successfully undeafened*.`,
	SUCCESSFULL_UNMUTE: (user) => `*${user[0]}#${user[1]} was successfully unmuted*.`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
