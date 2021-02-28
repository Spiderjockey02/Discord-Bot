const languageData = {
	// Misc
	TOO_POWERFUL: 'من قادر به ممنوعیت استفاده از این کاربر نیستم.',
	SELF_PUNISHMENT: 'نمی توانید خودتان را مجازات کنید.',
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
	NO_WARNINGS: 'این کاربر قبلاً هشدار داده نشده است.',
	WARNS_TITLE: (user) => `${user}'s warning list.`,
	// CLEAR MESSAGES
	MESSAGES_DELETED: (messages) => `${messages} messages were successfully deleted.`,
	// NICKNAME
	ENTER_NICKNAME: 'لطفاً یک نام مستعار وارد کنید.',
	LONG_NICKNAME: 'نام مستعار باید کوتاهتر از 32 نویسه باشد.',
	UNSUCCESSFULL_NICK: (user) => ` I am unable to change ${user} nickname.`,
	// REPORT COMMAND
	REPORT_AUTHOR: '~ممبر ریپورت شده است~',
	REPORT_MEMBER: 'ممبر:',
	REPORT_BY: 'ریپورت شده توسطه:',
	REPORT_IN: 'ریپورت شده در:',
	REPORT_REASON: 'دلیل:',
	// ticket command
	TICKET_EXISTS: 'شما از قبل تیکت باز کرده اید',
	NO_SUPPORT_ROLE: 'هنوز هیچ رول پشتیبانی در این سرور ایجاد نشده است.',
	NOT_SUPPORT: 'شما مجوزهای صحیحی برای بستن این کانال ندارید.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
