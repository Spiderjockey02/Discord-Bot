// Dependencies
const Discord = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message) => {
	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.username, bot.user.displayAvatarURL())
		.setTitle('About')
		.setDescription(`- [Dashboard](${bot.config.Dashboard.domain})
		- [Invite Link](https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=${bot.config.botID}&permissions=485846102&scope=bot)
		- [Commands](${bot.config.Dashboard.domain}/commands)
		- [Bot Support Server](${bot.config.SupportServer.link})
			${bot.user.username} is a fully customizable Discord Bot. This bot comes fully packed with a wide range of commands, an advanced moderation system and an extensive logging system. These features are highly customizable and easy to setup but there's no point me just telling you so come and find out for yourself.`)
		.addField('Members:', bot.users.cache.size, true)
		.addField('Channels:', `${bot.channels.cache.size} total\n${bot.channels.cache.filter(channel => channel.type === 'text').size} text, ${bot.channels.cache.filter(channel => channel.type === 'voice').size} voice\n${bot.channels.cache.filter(channel => channel.type === 'dm').size} DM`, true)
		.addField('Process:', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
		.addField('Servers:', `${bot.guilds.cache.size}\n${bot.ws.totalShards} shards`, true)
		.addField('Messages seen:', `${bot.Stats.MessageSent} messages\n${(bot.Stats.MessageSent / (bot.uptime / 1000)).toFixed(2)} msg/sec`, true)
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
	usage: '${PREFIX}about',
};
