const languageData = {
	UNKNOWN_USER: 'این نام کاربری یافت نشد.',
	INCORRECT_IP: '**هیچ سروری با آن IP به موقع پیدا نشد.**',

	WEATHER_TITLE: (place) => `Weather - ${place}`,
	WEATHER_DESCRIPTION: 'واحدهای دما ممکن است مدتی متفاوت باشند',
	WEATHER_TEMP: 'درجه حرارت:',
	WEATHER_SKY: 'متن آسمان:',
	WEATHER_HUMIDITY: 'رطوبت:',
	WEATHER_SPEED: 'سرعت باد:',
	WEATHER_TIME: 'زمان مشاهده:',
	WEATHER_DISPLAY: 'نمایشگر WInd:',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
