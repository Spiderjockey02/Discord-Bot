const languageData = {
	UNKNOWN_USER: 'This username was unable to be found.',
	INCORRECT_IP: '**No server with that IP was found in time.**',

	WEATHER_TITLE: (place) => `Weather - ${place}`,
	WEATHER_DESCRIPTION: 'Temperature units can may be differ some time',
	WEATHER_TEMP: 'Temperature:',
	WEATHER_SKY: 'Sky Text:',
	WEATHER_HUMIDITY: 'Humidity:',
	WEATHER_SPEED: 'Wind speed:',
	WEATHER_TIME: 'Observation Time:',
	WEATHER_DISPLAY: 'WInd Display:',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
