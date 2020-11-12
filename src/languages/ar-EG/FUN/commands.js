// This contains language files for the commands
const languageData = {
	FACT_TITLE: 'حقيقة عشوائي:',
	FLIP_CHOICE: (choice) => `${['رئيس', 'ذيول'][choice]}`,
	MEME_TITLE: 'من عند',
	MEME_FOOTER: 'مقدمة من',
	MISSING_POKEMON: 'That Pokemon dosen\'t exist.',
	RANDOM_RESPONSE: (number) => `Random number: ${number}`,
	REMINDER_MESSAGE: (r) => `سوف أذكرك \`${r[0]}\` في حوالي ${r[1]}.`,
	REMINDER_DESCRIPTION: 'رابط الرسالة',
	REMINDER_RESPONSE: (r) => `${r[0]} تذكيرك: ${r[1]}`,
	REMINDER_TITLE: 'تذكير',
	REMINDER_FOOTER: (time) => `تذكير من ${time} منذ.`,
	RPS_FIRST: 'اختار أنت',
	RPS_SECOND: 'انا اخترت',
	RPS_RESULT: (winner) => `نتيجة: ${winner} فاز!`,
	INCORRECT_URBAN: (phrase) => ` Phrase: \`${phrase}\` لم يتم العثور عليها في القاموس الحضري.`,
	URBAN_TITLE: (word) => `Definition of ${word}`,
	URBAN_DESCRIPTION: (r) => `${r[0]}\n**Example:**\n${r[1]}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
