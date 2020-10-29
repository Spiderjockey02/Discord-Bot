// Dependencies
const util = require('minecraft-server-util');
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Ping a minecraft server
	if(!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('mc').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const r = await message.channel.send('Pinging server..');
	// If no ping use 25565
	if(!args[1]) {
		args[1] = '25565';
	}
	// Ping server
	util.ping(args[0], { port: parseInt(args[1]) }).then((response) => {
		const embed = new Discord.MessageEmbed()
			.setColor(0x0099ff)
			.setTitle('Server Status')
			.setURL(`https://mcsrvstat.us/server/${args[0]}:${args[1]}`)
			.addField('Server IP:', response.host)
			.addField('Server Version:', response.version)
			.addField('Description:', response.description.descriptionText)
			.addField('Online Players', `${response.onlinePlayers}/${response.maxPlayers}`);
		r.delete();
		message.channel.send(embed);
	}).catch(err => {
		// An error occured (either no IP, Open port or timed out)
		r.delete({ timeout: 1000 });
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} **No server with that IP was found in time.**` } }).then(m => m.delete({ timeout: 4500 }));
		bot.logger.error(err.message);
	});
};

module.exports.config = {
	command: 'mc',
	aliases: ['minecraft'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Minecraft',
	category: 'Searcher',
	description: 'Pings a minecraft for information.',
	usage: '${PREFIX}mc <IP> [Port]',
};
