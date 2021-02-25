const languageData = {
	// error messages
	NO_QUEUE: 'Atualmente não há músicas tocando neste servidor.',
	NOT_VOICE: 'Você não está no mesmo canal de voz que eu.',
	MISSING_VOICE: 'Você não está em um canal de voz ao qual eu possa me conectar.',
	ERROR: (error) => `Ocorreu um erro ao pesquisar: \`${error}\``,
	// incorrect enteries
	LEFT_VOICE: 'Eu saí do canal de voz com sucesso.',
	NO_ARGS: 'Insira um nome / url para a música',
	TOO_HIGH: 'Insira um número entre 0 e 100.',
	NO_SONG: 'Não consigo encontrar essa música.',
	// pause/resume
	ALREADY_PAUSED: (prefix) => `Já estou em pausado, \`${prefix}resume\` continuar ouvindo.`,
	ALREADY_RESUMED: (prefix) => `Já estou tocando, \`${prefix}pause\` continuar ouvindo`,
	SUCCESFULL_PAUSE: 'Fila pausada com sucesso',
	SUCCESFULL_RESUME: 'Retomando a fila com sucesso',
	CHANNEL_MOVE: 'Mudei de canal com sucesso.',
	TIME_MOVED: (time) => `O tempo mudou para: \`${time}\`.`,

	SOUND_CURRENT: (volume) => `🔊 O volume atual é: **${volume}%**.`,
	SOUND_SET: (volume) => `🔊 Som do player definido para **${volume}%**.`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
