// This contains language files for the commands
const languageData = {
	// Guild commands
	AVATAR_TITLE: (user) => `Avatar for ${user}`,
	AVATAR_DESCRIPTION:	'**Links:**',
	NO_GUILD_ICON: 'This server does not have a server icon.',
	GUILD_ICON: 'Download',
	POLL_TITLE: (username) => `Poll created by ${username}`,
	POLL_FOOTER: 'React to vote..',

	// Role command
	ROLE_NAME: (roleName) => `Role | ${roleName}`,
	ROLE_MEMBERS: 'Members:',
	ROLE_COLOR: 'Color:',
	ROLE_POSITION: 'Position:',
	ROLE_MENTION: 'Mention:',
	ROLE_HOISTED: 'Hoisted:',
	ROLE_MENTIONABLE: 'Mentionable:',
	ROLE_PERMISSION: 'Key permissions:',
	ROLE_CREATED: 'Created at:',
	ROLE_FOOTER: (r) => `Requested by ${r[0]} | Role ID: ${r[1]}`,
	// user command
	USER_NICKNAME: 'Nickname:',
	USER_GAME: 'Game:',
	USER_ROLES: (number) => `Roles [${number[0]}/${number[1]}]:`,
	USER_JOINED: 'Joined date:',
	USER_REGISTERED: 'Registered:',
	USER_PERMISSIONS: (number) => `Permissions [${number}/31]:`,
	// Server command
	GUILD_NAME: 'Server name:',
	GUILD_OWNER: 'Server owner:',
	GUILD_ID: 'Server ID:',
	GUILD_CREATED: 'Server created date:',
	GUILD_REGION: 'Server region:',
	GUILD_VERIFICATION: 'Verification level:',
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
