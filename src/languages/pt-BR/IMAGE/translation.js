const languageData = {
	GENERATING_IMAGE: 'Gerando sua imagem..',
	TEXT_OVERLOAD: (number) => `Sua mensagem não deve ser mais do que ${number} caracteres`,
	GENERATE_DESC: (images) => `**1 imagem é necessária**:\n\`${images[0]}\`. \n**2 imagens são necessárias**:\n\`${images[1]}\`.`,
	INVALID_FILE: 'Esse formato de arquivo não é compatível atualmente.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
