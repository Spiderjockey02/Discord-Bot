// This contains language files for the commands
const languageData = {
	// Guild commands
	AVATAR_DESCRIPTION:	'**Links:**',
	NO_GUILD_ICON: 'This server does not have a server icon.',
	GUILD_ICON: 'Download',
	POLL_TITLE: (username) => `Poll created by ${username}`,
	POLL_FOOTER: 'React to vote..',

	ROLE_NAME: (roleName) => `Role | ${roleName}`,
	ROLE_MEMBERS: 'Members',
	ROLE_COLOR: 'Color',
	ROLE_POSITION: 'Position',
	ROLE_MENTION: 'Mention',
	ROLE_HOISTED: 'Hoisted',
	ROLE_MENTIONABLE: 'Mentionable',
	ROLE_PERMISSION: 'Key permissions',
	ROLE_CREATED: 'Created at',
	ROLE_FOOTER: (r) => `${r[0]} | Role ID: ${r[1]}`,

};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
