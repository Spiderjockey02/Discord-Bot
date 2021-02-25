const languageData = {
	UNKNOWN_USER: 'Este nome de usuário não foi encontrado.',
	INCORRECT_IP: '**Nenhum servidor com esse IP foi encontrado a tempo.**',

	WEATHER_TITLE: (place) => `Weather - ${place}`,
	WEATHER_DESCRIPTION: 'As unidades de temperatura podem ser diferentes em algum momento',
	WEATHER_TEMP: 'Temperature:',
	WEATHER_SKY: 'Sky Text:',
	WEATHER_HUMIDITY: 'Umidade:',
	WEATHER_SPEED: 'Velocidade do vento:',
	WEATHER_TIME: 'Tempo de Observação:',
	WEATHER_DISPLAY: 'Exibição de temp:',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
