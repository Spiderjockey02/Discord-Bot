// This contains language files for the commands
const languageData = {
	FACT_TITLE: 'Random Fact:',
	FLIP_CHOICE: (choice) => `${['Head', 'Tails'][choice]}`,
	MEME_TITLE: 'From',
	MEME_FOOTER: 'Provided by',
	RANDOM_RESPONSE: (r) => `Random number: ${r}`,
	REMINDER_MESSAGE: (r) => `I'll remind you about \`${r[0]}\` in about ${r[1]}.`,
	REMINDER_DESCRIPTION: 'Message link',
	REMINDER_RESPONSE: (r) => `${r[0]} your reminder: ${r[1]}`,
	REMINDER_TITLE: 'Reminder',
	REMINDER_FOOTER: (r) => `Reminder from ${r} ago.`,
	RPS_FIRST: 'You choose',
	RPS_SECOND: 'I choose',
	RPS_RESULT: (winner) => `Result: ${winner} has won!`,
	INCORRECT_URBAN: (r) => ` Phrase: \`${r}\` was not found on the urban dictionary.`,
	URBAN_TITLE: (r) => `Definition of ${r}`,
	URBAN_DESCRIPTION: (r) => `${r[0]}\n**Example:**\n${r[1]}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
