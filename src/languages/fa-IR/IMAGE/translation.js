const languageData = {
	GENERATING_IMAGE: 'در حال تولید تصویر خود ...',
	TEXT_OVERLOAD: (number) => `Your message must not be more than ${number} characters.`,
	GENERATE_DESC: (images) => `**1 Image is needed**:\n\`${images[0]}\`. \n**2 images is needed**:\n\`${images[1]}\`.`,
	INVALID_FILE: 'فرمت فایل در حال حاضر پشتیبانی نمیشود.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
