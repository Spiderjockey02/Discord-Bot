// This contains language files for the commands
const languageData = {
	ABOUT_MEMBERS: 'Membros:',
	ABOUT_CHANNELS: 'Canais:',
	ABOUT_PROCESS: 'Processos:',
	ABOUT_SERVERS: 'Servidores:',
	ABOUT_MESSAGES: 'Mensagens enviadas:',
	ABOUT_UPTIME: 'Uptime:',
	MISSING_COMMAND: 'Não é um comando nem um plugin.',
	NO_COMMAND: 'Este não é um comando em execução neste servidor.',
	INVITE_TEXT: 'Convide-me para o seu servidor',
	PRIVACY_POLICY: 'Privacy Policy',
	STATUS_PING: 'Ping:',
	STATUS_CLIENT: 'Client API:',
	STATUS_MONGO: 'MongoDB:',
	SUPPORT_TITLE: (username) => `${username} support`,
	SUPPORT_DESC: (websites) => `**Nosso Servidor:**  [Support Server](${websites[0]})\n **Nosso site:**  [Website](${websites[1]})\n **Git Repo:** [Website](https://github.com/Spiderjockey02/Discord-Bot)`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
