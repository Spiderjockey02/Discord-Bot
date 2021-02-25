// This contains language files for the commands
const languageData = {
	GUILD_COMMAND_ERROR: 'That command can only be ran in a server.',
	COMMAND_COOLDOWN: (seconds) => `Você deve esperar ${seconds} segundos entre cada comando.`,
	BLACKLISTED_CHANNEL: (user) => `**${user}**, esse comando está desabilitado neste canal.`,
	NOT_NSFW_CHANNEL: 'Esse comando só pode ser feito em um canal `NSFW`.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
