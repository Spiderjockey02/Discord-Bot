const languageData = {
	// Misc
	TOO_POWERFUL: 'Não posso banir este usuário devido ao seu poder.',
	SELF_PUNISHMENT: 'Você não pode se punir.',
	NOT_INVOICE: (user) => `${user} não está em um canal de voz.`,
	REASON: (reason) => `**Motivo:** ${reason}`,

	// successfull moderation
	SUCCESSFULL_BAN: (user) => `*${user} foi banido com sucesso*.`,
	SUCCESSFULL_DEAFEN: (user) => `*${user} foi ensurdecido com sucesso*.`,
	SUCCESSFULL_MUTE: (user) => `*${user} foi silenciado com sucesso*.`,
	SUCCESSFULL_KICK: (user) => `*${user} foi expulso com sucesso*.`,
	SUCCESSFULL_NICK: (user) => `*Apelido alterado com sucesso de ${user}.*`,
	SUCCESSFULL_SLOWMODE: (time) => `Slowmode definido para **${time}**.`,
	SUCCESSFULL_UNBAN: (user) => `*${user} foi desbanido com sucesso*.`,
	SUCCESSFULL_UNMUTE: (user) => `*${user} foi desmutado com sucesso*.`,
	SUCCESSFULL_UNDEAFEN: (user) => `*${user} foi ensurdecido com sucesso*.`,
	SUCCESSFULL_REPORT: (user) => `*${user} foi report com sucesso*.`,
	SUCCESSFULL_WARN: (user) => `${user} foi avisado`,
	SUCCESSFULL_KWARNS: (user) => `*${user} foi expulso com sucesso por ter muitos avisos*.`,
	// WARNINGS
	CLEARED_WARNINGS: (user) => `Avisos de ${user} foi limpo.`,
	NO_WARNINGS: 'Este usuário não foi avisado antes.',
	WARNS_TITLE: (user) => `${user}'s lista de advertência.`,
	// CLEAR MESSAGES
	MESSAGES_DELETED: (messages) => `${messages} mensagens foram apagadas com sucesso.`,
	// NICKNAME
	ENTER_NICKNAME: 'Por favor, digite um apelido.',
	LONG_NICKNAME: 'O apelido deve ter menos de 32 caracteres.',
	UNSUCCESSFULL_NICK: (user) => ` Eu não consigo mudar ${user} apelido.`,
	// REPORT COMMAND
	REPORT_AUTHOR: '~Member Reported~',
	REPORT_MEMBER: 'Member:',
	REPORT_BY: 'Reported by:',
	REPORT_IN: 'Reported in:',
	REPORT_REASON: 'Reason:',
	// ticket command
	TICKET_EXISTS: 'Você já tem um canal de tickets',
	NO_SUPPORT_ROLE: 'Nenhuma função de suporte foi criada neste servidor ainda.',
	NOT_SUPPORT: 'Você não tem as permissões corretas para fechar este canal.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
