// This contains language files for the commands
const languageData = {
	SUCCESS_GIVEAWAY: (action) => `Sucesso! Giveaway ${action}!`,
	UNKNOWN_GIVEAWAY: (message) => `Nenhuma oferta encontrada com o ID da mensagem: \`${message}\`, Por favor verifique e tente novamente.`,
	EDIT_GIVEAWAY: (time) => `Sucesso! Giveaway será atualizado em menos de ${time} segundos.`,
	INCORRECT_WINNER_COUNT: 'A contagem do vencedor deve ser um número.',
	//
	GIVEAWAY_DATA: {
		giveaway: '🎉\t**GIVEAWAY**\t🎉',
		giveawayEnded: '🎉\t**Sorteio encerrado**\t🎉',
		timeRemaining: 'Tempo restante: **{duration}**!',
		inviteToParticipate: 'Reaja com 🎉 para participar!',
		winMessage: 'Parabéns, {winners}! você venceu **{prize}**!\n{messageURL}',
		noWinner: 'Giveaway cancelado, nenhuma participação válida.',
		hostedBy: 'Feito Por: {user}',
		winners: 'Vencedor(s)',
		endedAt: 'Terminou em',
		units: {
			seconds: 'segundos',
			minutes: 'minutos',
			hours: 'horas',
			days: 'dias',
		},
	},
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
