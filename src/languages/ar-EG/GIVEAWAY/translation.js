// This contains language files for the commands
const languageData = {
	SUCCESS_GIVEAWAY: (action) => `نجاح! يتبرع ${action}!`,
	UNKNOWN_GIVEAWAY: (message) => `لم يتم العثور على هبة ل ${message}, يرجى مراجعة وحاول مرة أخرى.`,
	EDIT_GIVEAWAY: (time) => `نجاح! سيتم تحديث الهبة في أقل من ${time} ثواني.`,
	INCORRECT_WINNER_COUNT: 'يجب أن يكون عدد الفائزين رقمًا.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
