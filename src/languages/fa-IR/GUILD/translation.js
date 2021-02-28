// This contains language files for the commands
const languageData = {
	// Guild commands
	AVATAR_TITLE: (user) => `Avatar for ${user}`,
	AVATAR_DESCRIPTION:	'**لینک:**',
	NO_GUILD_ICON: 'این سرور آواتار ندارد.',
	GUILD_ICON: 'دانلود',
	POLL_TITLE: (username) => `Poll created by ${username}`,
	POLL_FOOTER: 'برای رأی دادن ری اکت کنید ..',

	// Role command
	ROLE_NAME: (roleName) => `Role | ${roleName}`,
	ROLE_MEMBERS: 'ممبرها:',
	ROLE_COLOR: 'رنگ:',
	ROLE_POSITION: 'موقیعت:',
	ROLE_MENTION: 'مونشن:',
	ROLE_HOISTED: 'ساخته شده:',
	ROLE_MENTIONABLE: 'قابل ذکر است:',
	ROLE_PERMISSION: 'مجوز پرمیشن ها:',
	ROLE_CREATED: 'ایجاد شده در:',
	ROLE_FOOTER: (r) => `Requested by ${r[0]} | Role ID: ${r[1]}`,
	// user command
	USER_NICKNAME: 'نام مستعار:',
	USER_GAME: 'بازی:',
	USER_ROLES: (number) => `Roles [${number[0]}/${number[1]}]:`,
	USER_JOINED: 'تاریخ پیوستن:',
	USER_REGISTERED: 'ثبت شده:',
	USER_PERMISSIONS: (number) => `Permissions [${number}/31]:`,
	// Server command
	GUILD_NAME: 'اسم سرور:',
	GUILD_OWNER: 'آونر سرور:',
	GUILD_ID: 'آیدی سرور:',
	GUILD_CREATED: 'زمان ساخته شدن سرور:',
	GUILD_REGION: 'ریجن سرور:',
	GUILD_VERIFICATION: 'سطح تأیید:',
	GUILD_MEMBER: (number) => `Member count [${number}]:`,
	GUILD_FEATURES: 'Features:',
	GUILD_ROLES: (number) => `Roles [${number}]:`,
	// FOOTER
	INFO_FOOTER: (user) => `Requested by: ${user}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
