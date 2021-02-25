const languageData = {
	LEADERBOARD_TITLE: 'Leaderboard',
	LEADERBOARD_FIELDT: 'Nenhum dado encontrado!',
	LEADERBOARD_FIELDDESC: 'Por favor, digite no chat para ganhar experiência.',
	NO_MESSAGES: 'Você ainda não está classificado. Envie algumas mensagens primeiro e tente novamente.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
