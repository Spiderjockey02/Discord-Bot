// This contains language files for the commands
const languageData = {
	FACT_TITLE: 'رندوم فکت:',
	FLIP_CHOICE: (choice) => `${['سر', 'دُم'][choice]}`,
	MEME_TITLE: 'از جانب',
	MEME_FOOTER: 'تهیه شده توسط',
	MISSING_POKEMON: 'این پوکمن وجود ندارد',
	RANDOM_RESPONSE: (number) => `Random number: ${number}`,
	REMINDER_MESSAGE: (r) => `I'll remind you about \`${r[0]}\` in about ${r[1]}.`,
	REMINDER_DESCRIPTION: 'لینک پیام',
	REMINDER_RESPONSE: (r) => `${r[0]} your reminder: ${r[1]}`,
	REMINDER_TITLE: 'یادآوری',
	REMINDER_FOOTER: (time) => `Reminder from ${time} ago.`,
	RPS_FIRST: 'شما انتخاب کردید',
	RPS_SECOND: 'من انتخاب می کنم',
	RPS_RESULT: (winner) => `Result: ${winner} has won!`,
	INCORRECT_URBAN: (phrase) => ` Phrase: \`${phrase}\` was not found on the urban dictionary.`,
	URBAN_TITLE: (word) => `Definition of ${word}`,
	URBAN_DESCRIPTION: (r) => `${r[0]}\n**Example:**\n${r[1]}`,
	PERSON_AUTHOR: 'من شخصی را از طریق اینترنت پیدا کردم که اسم اوست ',
	PERSON_FOOTER: 'توجه: اینها به طور تصادفی از طریق API تولید می شوند..',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
