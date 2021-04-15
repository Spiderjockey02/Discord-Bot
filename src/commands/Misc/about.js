// Dependencies
const { MessageEmbed, version } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class About extends Command {
	constructor(bot) {
		super(bot, {
			name: 'about',
			dirname: __dirname,
			aliases: ['bio', 'botinfo'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Information about me.',
			usage: 'about',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		const embed = new MessageEmbed()
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTitle('About')
			.setDescription(`- [Dashboard](${bot.config.websiteURL})
				- [Invite Link](https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=${bot.user.id}&permissions=485846102&scope=bot)
				- [Commands](${bot.config.websiteURL}/commands)
				- [Bot Support Server](${bot.config.SupportServer.link})
					${bot.user.username} is a fully customizable Discord Bot. This bot comes fully packed with a wide range of commands, an advanced moderation system and an extensive logging system. These features are highly customizable and easy to setup but there's no point me just telling you so come and find out for yourself.`)
			.addField(bot.translate(settings.Language, 'MISC/ABOUT_MEMBERS'), `${bot.users.cache.size} total\n${bot.users.cache.filter(user => user.bot).size} bots, ${bot.users.cache.filter(user => !user.bot).size} humans`, true)
			.addField(bot.translate(settings.Language, 'MISC/ABOUT_CHANNELS'), `${bot.channels.cache.size} total\n${bot.channels.cache.filter(channel => channel.type === 'text').size} text, ${bot.channels.cache.filter(channel => channel.type === 'voice').size} voice\n${bot.channels.cache.filter(channel => channel.type === 'dm').size} DM`, true)
			.addField(bot.translate(settings.Language, 'MISC/ABOUT_PROCESS'), `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\nNode.js: ${process.version.slice(1).split('.')[0]}v\nDiscord.js: ${version}v`, true)
			.addField(bot.translate(settings.Language, 'MISC/ABOUT_SERVERS'), `${bot.guilds.cache.size}\n${bot.ws.totalShards} shards`, true)
			.addField(bot.translate(settings.Language, 'MISC/ABOUT_MESSAGES'), `${bot.messagesSent} messages\n ${(bot.messagesSent / (bot.uptime / 1000)).toFixed(2)} msg/sec`, true)
			.addField(bot.translate(settings.Language, 'MISC/ABOUT_UPTIME'), bot.timeFormatter.getReadableTime(bot.uptime), true);
		message.channel.send(embed);
	}
};
