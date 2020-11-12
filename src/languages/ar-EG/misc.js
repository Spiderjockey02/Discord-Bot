const languageData = {
	// Miscellenous
	ERROR_MESSAGE: 'حدث خطأ أثناء تشغيل هذا الأمر ، يرجى المحاولة مرة أخرى أو الاتصال بالدعم.',
	INCORRECT_FORMAT: (commandExample) => `الرجاء استخدام التنسيق: \`${commandExample}\`.`,
	MISSING_PERMISSION: (permission) => `أنا مفقود الإذن: \`${permission}\`.`,
	USER_PERMISSION: (permission) => `أنت تفتقد الإذن: \`${permission}\`.`,
	MISSING_ROLE: 'لم أتمكن من العثور على هذا الدور.',
	NO_REASON: 'لا يوجد سبب معين.',
	// Level
	// Misc
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
