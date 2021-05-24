// Dependencies
const { version } = require('discord.js'),
	{ Embed } = require('../../utils'),
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
	async run(bot, message) {
		const embed = new Embed(bot, message.guild)
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTitle('misc/about:TITLE')
			.setDescription(message.translate('misc/about:DESC', { URL: bot.config.websiteURL, INVITE: bot.config.inviteLink, SERVER: bot.config.websiteURL, USERNAME: bot.user.username }))
			.addField(message.translate('misc/about:MEMBERS'), message.translate('misc/about:MEMBERS_DESC', { USERS: bot.users.cache.size, BOTS: bot.users.cache.filter(user => user.bot).size, HUMANS: bot.users.cache.filter(user => !user.bot).size }), true)
			.addField(message.translate('misc/about:CHANNELS'), message.translate('misc/about:CHANNELS_DESC', { CHANNELS: bot.channels.cache.size, TEXT: bot.channels.cache.filter(channel => channel.type === 'text').size, VOICE: bot.channels.cache.filter(channel => channel.type === 'voice').size, DM: bot.channels.cache.filter(channel => channel.type === 'dm').size }), true)
			.addField(message.translate('misc/about:PROCESS'),	message.translate('misc/about:PROCESS_DESC', { RAM: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), NODE: process.version.slice(1).split('.')[0], DISCORD: version }), true)
			.addField(message.translate('misc/about:SERVERS'), message.translate('misc/about:SERVERS_DESC', { SERVERS: bot.guilds.cache.size, SHARDS: bot.ws.totalShards }), true)
			.addField(message.translate('misc/about:MESSAGES'), message.translate('misc/about:MESSAGES_DESC', { MESSAGES: bot.messagesSent, MSGSEC: (bot.messagesSent / (bot.uptime / 1000)).toFixed(2) }), true)
			.addField(message.translate('misc/about:UPTIME'), bot.timeFormatter.getReadableTime(bot.uptime), true);
		message.channel.send(embed);
	}
};
