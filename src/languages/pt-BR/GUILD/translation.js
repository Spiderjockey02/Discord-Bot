// This contains language files for the commands
const languageData = {
	// Guild commands
	AVATAR_TITLE: (user) => `Avatar de ${user}`,
	AVATAR_DESCRIPTION:	'**Links:**',
	NO_GUILD_ICON: 'Este servidor não possui um ícone',
	GUILD_ICON: 'Download',
	POLL_TITLE: (username) => `Enquete criada por ${username}`,
	POLL_FOOTER: 'Reaja para votar ..',

	// Role command
	ROLE_NAME: (roleName) => `Cargo | ${roleName}`,
	ROLE_MEMBERS: 'Membros:',
	ROLE_COLOR: 'Cor:',
	ROLE_POSITION: 'Posição:',
	ROLE_MENTION: 'Menção:',
	ROLE_HOISTED: 'Hosted:',
	ROLE_MENTIONABLE: 'Mencionáveis:',
	ROLE_PERMISSION: 'chaves de permissões :',
	ROLE_CREATED: 'Criado em:',
	ROLE_FOOTER: (r) => `Requerido por ${r[0]} | Role ID: ${r[1]}`,
	// user command
	USER_NICKNAME: 'Nickname:',
	USER_GAME: 'Game:',
	USER_ROLES: (number) => `Cargo [${number[0]}/${number[1]}]:`,
	USER_JOINED: 'Entrou em:',
	USER_REGISTERED: 'Registrou-se em:',
	USER_PERMISSIONS: (number) => `Permissoes [${number}/31]:`,
	// Server command
	GUILD_NAME: 'Nome do Servidor:',
	GUILD_OWNER: 'Dono do Servidor:',
	GUILD_ID: 'ID do Servidor:',
	GUILD_CREATED: 'Servidor criado em:',
	GUILD_REGION: 'Região do Servidor:',
	GUILD_VERIFICATION: 'Nivel de verificação:',
	GUILD_MEMBER: (number) => `Numeros de membro [${number}]:`,
	GUILD_FEATURES: 'Características:',
	GUILD_ROLES: (number) => `Cargos [${number}]:`,
	// FOOTER
	INFO_FOOTER: (user) => `Requerido por: ${user}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
