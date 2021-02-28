const languageData = {
	LEADERBOARD_TITLE: 'لیدربورد',
	LEADERBOARD_FIELDT: 'داده ای یافت نشد',
	LEADERBOARD_FIELDDESC: 'لطفاً برای به دست آوردن اکس پی در گپ تایپ کنید.',
	NO_MESSAGES: 'شما فاقد رنک هستند لطفاً کمی پیام دهید تا رنکتان فعال شود.',
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
