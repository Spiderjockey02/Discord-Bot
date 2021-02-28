// This contains language files for the commands
const languageData = {
	GUILD_COMMAND_ERROR: 'ین دستور فقط در سرور قابل اجرا است..',
	COMMAND_COOLDOWN: (seconds) => `You must wait ${seconds} seconds between each command.`,
	BLACKLISTED_CHANNEL: (user) => `**${user}**, that command is disabled in this channel.`,
	NOT_NSFW_CHANNEL: 'این دستور فقط در کانال `NSFW` قابل انجام است..',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
