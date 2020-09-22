const Discord = require('discord.js');
module.exports.run = async (bot, message, args, settings) => {
	// Reports User
	if (message.deletable) message.delete();
	// Make sure !report is a command
	if (settings.ModLogEvents.includes('report')) {
		const user = message.mentions.members.first() || message.guild.members.get(args[0]);
		if (!user) {
			message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
			return;
		}
		if (!args[1]) {
			message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('report').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
			return;
		}
		// Checks for audit log text channel
		const embed = new Discord.MessageEmbed()
			.setAuthor('~Member Reported~', user.user.displayAvatarURL)
			.addField('Member:', user, true)
			.addField('Reported by:', message.member, true)
			.addField('Reported in:', message.channel)
			.addField('Reason:', args.slice(1).join(' '))
			.setTimestamp()
			.setFooter(message.guild.name);
		const repChannel = message.guild.channels.cache.find(channel => channel.name === settings.ModLogChannel);
		if (repChannel) {
			repChannel.send(embed).catch(bot.logger.error(`Missing access to ${settings.ModLogChannel} in server: [${message.guild.id}]`));
			message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} *${user.user.username} has been successfully reported*.` } }).then(m => m.delete({ timeout: 3000 }));
		}
	}
};

module.exports.config = {
	command: 'report',
	aliases: ['rep'],
};

module.exports.help = {
	name: 'Report',
	category: 'Guild',
	description: 'Reports a user',
	usage: '!report {user} [reason]',
};
