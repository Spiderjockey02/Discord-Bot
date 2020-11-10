const languageData = {
	GENERATING_IMAGE: 'Generating your image..',
	CMM_TEXT: 'Your message must not be more than 80 characters.',
	CLYDE_TEXT: 'Your message must not be more than 70 characters.',
	TWITTER_TEXT: 'Your message must not be more than 60 characters.',
	GENERATE_DESC: (r) => `**1 Image is needed**:\n\`${r[0]}\`. \n**2 images is needed**:\n\`${r[1]}\`.`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
