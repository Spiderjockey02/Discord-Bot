// Dependencies
const { MessageEmbed, version } = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message, args, settings) => {
	const embed = new MessageEmbed()
		.setAuthor(bot.user.username, bot.user.displayAvatarURL())
		.setTitle('About')
		.setDescription(`- [Dashboard](${bot.config.websiteURL})
			- [Invite Link](https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=${bot.user.id}&permissions=485846102&scope=bot)
			- [Commands](${bot.config.websiteURL}/commands)
			- [Bot Support Server](${bot.config.SupportServer.link})
				${bot.user.username} is a fully customizable Discord Bot. This bot comes fully packed with a wide range of commands, an advanced moderation system and an extensive logging system. These features are highly customizable and easy to setup but there's no point me just telling you so come and find out for yourself.`)
		.addField(message.translate(settings.Language, 'MISC/ABOUT_MEMBERS'), `${bot.users.cache.size} total\n${bot.users.cache.filter(user => user.bot).size} bots, ${bot.users.cache.filter(user => !user.bot).size} humans`, true)
		.addField(message.translate(settings.Language, 'MISC/ABOUT_CHANNELS'), `${bot.channels.cache.size} total\n${bot.channels.cache.filter(channel => channel.type === 'text').size} text, ${bot.channels.cache.filter(channel => channel.type === 'voice').size} voice\n${bot.channels.cache.filter(channel => channel.type === 'dm').size} DM`, true)
		.addField(message.translate(settings.Language, 'MISC/ABOUT_PROCESS'), `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\nNode.js: ${process.version.slice(1).split('.')[0]}v\nDiscord.js: ${version}v`, true)
		.addField(message.translate(settings.Language, 'MISC/ABOUT_SERVERS'), `${bot.guilds.cache.size}\n${bot.ws.totalShards} shards`, true)
		.addField(message.translate(settings.Language, 'MISC/ABOUT_MESSAGES'), '? messages\n ? msg/sec', true)
		.addField(message.translate(settings.Language, 'MISC/ABOUT_UPTIME'), moment.duration(bot.uptime).format(' D [days], H [hrs], m [mins], s [secs]'), true);
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
