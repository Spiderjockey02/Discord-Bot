const languageData = {
	EVAL_NO_OWNER: '**O que você pensa que está fazendo?**',
	EVAL_ERROR: (error) => `Erro ao avaliar: \`${error}\``,
	EVAL_RESPONSE: (diff) => `*Executado em ${diff[0][0] > 0 ? `${diff[0][0]}s` : ''}${diff[0][1] / 1000000}ms.*\`\`\`javascript\n${diff[1]}\n\`\`\``,
	RELOAD_ERROR: (name) => `Não foi possível recarregar: \`${name}\`.`,
	RELOAD_NO_COMMAND: (name) => `${name} não é um comando..`,
	RELOAD_SUCCESS: (name) => `Comando: \`${name}\` foi recarregado.`,
	SHUTDOWN: 'Ah .. ok adeus :disappointed_relieved:',
	SHUTDOWN_ERROR: (error) => `ERROR: ${error}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
