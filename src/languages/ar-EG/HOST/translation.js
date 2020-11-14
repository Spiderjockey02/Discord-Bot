const languageData = {
	EVAL_NO_OWNER: '**ماذا تظن نفسك فاعلا?**',
	EVAL_ERROR: (error) => `خطأ أثناء التقييم: \`${error}\``,
	EVAL_RESPONSE: (diff) => `*Executed in ${diff[0][0] > 0 ? `${diff[0][0]}s` : ''}${diff[0][1] / 1000000}ms.*\`\`\`javascript\n${diff[1]}\n\`\`\``,
	RELOAD_ERROR: (name) => `تعذر إعادة التحميل: \`${name}\`.`,
	RELOAD_NO_COMMAND: (name) => `${name} ليس وصية.`,
	RELOAD_SUCCESS: (name) => `أمر: \`${name}\` تم إعادة تحميله.`,
	SHUTDOWN: 'أوه .. طيب وداعا :disappointed_relieved:',
	SHUTDOWN_ERROR: (error) => `ERROR: ${error}`,
};

const translate = (key, args) => {
	const translation = languageData[key];
	if(typeof translation === 'function') return translation(args);
	else return translation;
};

module.exports = translate;
