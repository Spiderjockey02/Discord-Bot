// Dependencies
const { status } = require('minecraft-server-util');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Ping a minecraft server
	if(!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('mc').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	const r = await message.channel.send('Pinging server..');

	// If no ping use 25565
	if(!args[1]) args[1] = '25565';

	// Ping server
	status(args[0], { port: parseInt(args[1]) }).then((response) => {
		const embed = new MessageEmbed()
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
		r.delete();
		if (message.deletable) message.delete();
		message.error(settings.Language, 'SEARCHER/INCORRECT_IP').then(m => m.delete({ timeout: 4500 }));
		if (bot.config.debug) bot.logger.error(`${err.message} - command: mc.`);
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
