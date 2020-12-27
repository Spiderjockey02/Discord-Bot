// This contains language files for the commands
const languageData = {
	FACT_TITLE: 'Random Fact:',
	FLIP_CHOICE: (choice) => `${['Head', 'Tails'][choice]}`,
	MEME_TITLE: 'From',
	MEME_FOOTER: 'Provided by',
	MISSING_POKEMON: 'That pokemon doesn\'t exist',
	RANDOM_RESPONSE: (number) => `Random number: ${number}`,
	REMINDER_MESSAGE: (r) => `I'll remind you about \`${r[0]}\` in about ${r[1]}.`,
	REMINDER_DESCRIPTION: 'Message link',
	REMINDER_RESPONSE: (r) => `${r[0]} your reminder: ${r[1]}`,
	REMINDER_TITLE: 'Reminder',
	REMINDER_FOOTER: (time) => `Reminder from ${time} ago.`,
	RPS_FIRST: 'You choose',
	RPS_SECOND: 'I choose',
	RPS_RESULT: (winner) => `Result: ${winner} has won!`,
	INCORRECT_URBAN: (phrase) => ` Phrase: \`${phrase}\` was not found on the urban dictionary.`,
	URBAN_TITLE: (word) => `Definition of ${word}`,
	URBAN_DESCRIPTION: (r) => `${r[0]}\n**Example:**\n${r[1]}`,
	PERSON_AUTHOR: 'I found a person over internet whose name is ',
	PERSON_FOOTER: 'NOTE : These all are randomly generated through an API.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
