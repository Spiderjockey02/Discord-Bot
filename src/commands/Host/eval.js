// Dependencies
const { inspect } = require('util');

module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Makes sure only the bot owner can do this command
	if (message.member.id != bot.config.ownerID) return;
	const toEval = args.join(' ');
	// Evaluated the code
	try {
		if (toEval) {
			const hrStart = process.hrtime();
			const evaluated = inspect(eval(toEval, { depth: 0 }));
			const hrDiff = process.hrtime(hrStart);
			return await message.channel.send(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*\`\`\`javascript\n${evaluated}\n\`\`\``, { maxLength: 1900 });
		} else {
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('eval').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 3000 }));
		}
	} catch(e) {
		message.channel.send(`Error whilst evaluating: \`${e.message}\``);
	}
};

module.exports.config = {
	command: 'eval',
};

module.exports.help = {
	name: 'eval',
	category: 'Host',
	description: 'Evaluates code',
	usage: '${PREFIX}eval <code>',
};
