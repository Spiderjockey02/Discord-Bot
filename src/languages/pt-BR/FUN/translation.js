// This contains language files for the commands
const languageData = {
	FACT_TITLE: 'Fatos aleatório:',
	FLIP_CHOICE: (choice) => `${['Cara', 'Coroa'][choice]}`,
	MEME_TITLE: 'De',
	MEME_FOOTER: 'Fornecido por',
	MISSING_POKEMON: 'Esse Pokémon não existe',
	RANDOM_RESPONSE: (number) => `Número aleatório: ${number}`,
	REMINDER_MESSAGE: (r) => `Eu vou te lembrar sobre \`${r[0]}\` em cerca de ${r[1]}.`,
	REMINDER_DESCRIPTION: 'Link de mensagem',
	REMINDER_RESPONSE: (r) => `${r[0]} seu lembrete: ${r[1]}`,
	REMINDER_TITLE: 'Lembrete',
	REMINDER_FOOTER: (time) => `Lembrete de ${time} atrás.`,
	RPS_FIRST: 'Você escolhe',
	RPS_SECOND: 'Eu escolho',
	RPS_RESULT: (winner) => `Resutado: ${winner} venceu`,
	INCORRECT_URBAN: (phrase) => ` Frase: \`${phrase}\` não foi encontrado no registro de unban.`,
	URBAN_TITLE: (word) => `Definição de ${word}`,
	URBAN_DESCRIPTION: (r) => `${r[0]}\n**Exemplo:**\n${r[1]}`,
	PERSON_AUTHOR: 'Eu encontrei uma pessoa na internet cujo nome é ',
	PERSON_FOOTER: 'NOTA: Todos eles são gerados aleatoriamente por meio de uma API.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
