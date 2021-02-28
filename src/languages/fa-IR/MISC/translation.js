// This contains language files for the commands
const languageData = {
	ABOUT_MEMBERS: 'ممبر ها:',
	ABOUT_CHANNELS: 'چنل ها:',
	ABOUT_PROCESS: 'روند:',
	ABOUT_SERVERS: 'سرور ها:',
	ABOUT_MESSAGES: 'پیامها مشاهده شد:',
	ABOUT_UPTIME: 'وقت بالا:',
	MISSING_COMMAND: 'نه یک کامند نه یک پلاگین.',
	NO_COMMAND: 'این یک دستور در حال اجرا بر روی این سرور نیست..',
	INVITE_TEXT: 'مرا به سرور خود دعوت کنید',
	PRIVACY_POLICY: 'سیاست حفظ حریم خصوصی',
	STATUS_PING: 'پینگ:',
	STATUS_CLIENT: 'Client API:',
	STATUS_MONGO: 'MongoDB:',
	SUPPORT_TITLE: (username) => `${username} support`,
	SUPPORT_DESC: (websites) => `**Our Server:**  [Support Server](${websites[0]})\n **Our website:**  [Website](${websites[1]})\n **Git Repo:** [Website](https://github.com/Spiderjockey02/Discord-Bot)`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
