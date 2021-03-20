// For better permissions
const permissions = require('../../utils/permissions.json');

const languageData = {
	ERROR_MESSAGE: 'هنگام اجرای این دستور خطایی روی داد ، لطفاً دوباره امتحان کنید یا با پشتیبانی تماس بگیرید.',
	INCORRECT_FORMAT: (commandExample) => `Please use the format: \`${commandExample}\`.`,
	MISSING_PERMISSION: (permission) => `I am missing the permission: \`${permissions[permission]}\`.`,
	USER_PERMISSION: (permission) => `You are missing the permission: \`${permissions[permission]}\`.`,
	MISSING_ROLE: 'من نتوانستم این نقش را پیدا کنم.',
	NO_REASON: 'هیچ دلیلی ذکر نشده است.',
	// external files/plugins
	INCORRECT_DELIMITERS: 'لطفاً از یکی از جدا کننده های زمان زیر استفاده کنید: `d`,  `h`,  `m`, `s`.',
	NOT_NUMBER:'باید یک عدد باشد.',
	MAX_TIME: 'بیشتر از 10 روز نمی تواند باشد.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
