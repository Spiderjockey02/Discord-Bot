const Discord = require('discord.js');
const moment = require('moment');
function secNSec2ms(secNSec) {
	if (Array.isArray(secNSec)) {
		return secNSec[0] * 1000 + secNSec[1] / 1000000;
	} else {
		return secNSec / 1000;
	}
}
module.exports.run = async (bot, message) => {
	// Make sure bot can see invites
	const startTime = process.hrtime();
	const startUsage = process.cpuUsage();
	const now = Date.now();
	while (Date.now() - now < 500) {console.log(process.cpuUsage());}
	const elapTime = process.hrtime(startTime);
	const elapUsage = process.cpuUsage(startUsage);
	const elapTimeMS = secNSec2ms(elapTime);
	const elapUserMS = secNSec2ms(elapUsage.user);
	const elapSystMS = secNSec2ms(elapUsage.system);
	const cpuPercent = Math.round(100 * (elapUserMS + elapSystMS) / elapTimeMS);
	const embed = new Discord.MessageEmbed()
		.setTitle(`${bot.user.username}'s information`)
		.setDescription('Stuff')
		.addField('Members:', bot.users.cache.size, true)
		.addField('Channels', bot.channels.cache.size, true)
		.addField('Process:', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n${cpuPercent} %`, true)
		.addField('Servers:', bot.guilds.cache.size, true)
		.addField('Messages seen:', 'some number', true)
		.addField('Uptime:', moment.duration(bot.uptime).format(' D [days], H [hrs], m [mins], s [secs]'), true);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'about',
	aliases: ['bio'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'About',
	category: 'Misc',
	description: 'Information about me.',
	usage: '!about',
};
