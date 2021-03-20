// For better permissions
const permissions = require('../../utils/permissions.json');

const languageData = {
	ERROR_MESSAGE: 'Ocorreu um erro ao executar este comando, tente novamente ou entre em contato com o suporte.',
	INCORRECT_FORMAT: (commandExample) => `Use o formato: \`${commandExample}\`.`,
	MISSING_PERMISSION: (permission) => `Estou sem a permissão: \`${permissions[permission]}\`.`,
	USER_PERMISSION: (permission) => `Você está faltando a permissão de: \`${permissions[permission]}\`.`,
	MISSING_ROLE: 'Não consegui encontrar esse cargo.',
	NO_REASON: 'Nenhuma razão dada.',
	// external files/plugins
	INCORRECT_DELIMITERS: 'Use um dos seguintes delimitadores de tempo: `d`,  `h`,  `m`, `s`.',
	NOT_NUMBER:'Deve ser um número.',
	MAX_TIME: 'Não pode ser superior a 10 dias.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
