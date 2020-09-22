const { inspect } = require('util');
module.exports.run = async (bot, message, args) => {
	// Makes sure only 'I am Ben#6686' can do this command (Bot owner)
	if (message.member.id != bot.config.ownerID) return;
	const toEval = args.join(' ');
	const evaluated = inspect(eval(toEval, { depth: 0 }));
	try {
		if (toEval) {
			const hrStart = process.hrtime();
			const hrDiff = process.hrtime(hrStart);
			return message.channel.send(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*\`\`\`javascript\n${evaluated}\n\`\`\``, { maxLength: 1900 });
		}
		else {
			message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('eval').help.usage}\`.` } }).then(m => m.delete({ timeout: 3000 }));
		}
	}
	catch(e) {
		message.channel.send(`Error whilst evaluating: \`${e.message}\``);
	}
};
module.exports.config = {
	command: 'eval',
	aliases: ['eval'],
};
module.exports.help = {
	name: 'eval',
	category: 'Host',
	description: 'Evaluates code',
	usage: '!eval [code]',
};
