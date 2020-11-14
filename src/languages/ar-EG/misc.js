const languageData = {
	// Miscellenous
	ERROR_MESSAGE: 'حدث خطأ أثناء تشغيل هذا الأمر ، يرجى المحاولة مرة أخرى أو الاتصال بالدعم.',
	INCORRECT_FORMAT: (commandExample) => `الرجاء استخدام التنسيق: \`${commandExample}\`.`,
	MISSING_PERMISSION: (permission) => `أنا مفقود الإذن: \`${permission}\`.`,
	USER_PERMISSION: (permission) => `أنت تفتقد الإذن: \`${permission}\`.`,
	MISSING_ROLE: 'لم أتمكن من العثور على هذا الدور.',
	NO_REASON: 'لا يوجد سبب معين.',
	// external files/plugins
	INCORRECT_DELIMITERS: 'Please use one of the following time delimiters: `d`,  `h`,  `m`, `s`.',
	NOT_NUMBER:'Must be a number.',
	MAX_TIME: 'Can\'t be longer than 10 days.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
