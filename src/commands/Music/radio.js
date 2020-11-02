// get radios
const radio = require('../../assets/datafiles/radiostations.json');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Check if user is in a voice channel
	if (!message.member.voice) {
		message.channel.send({ embed:{ color:15158332, description:'Please connect to a voice channel.' } }).then(m => m.delete({ timeout: 3500 }));
		message.delete();
		return;
	}
	// Check if bot can join channel
	if (!message.guild.me.hasPermission('CONNECT')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`CONNECT\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}].`);
		return;
	}
	// Check if bot can speak in channel
	if (!message.guild.me.hasPermission('SPEAK')) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`SPEAK\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}].`);
		return;
	}

	// Make sure an entry was included
	if (args.length == 0) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('radio').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	if (args[0].toLowerCase() == 'list') {
		console.log(radio);
		console.log(radio.length);
		console.log(radio.size);
	}
};
module.exports.config = {
	command: 'radio',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'radio',
	category: 'Music',
	description: 'Play the radio.',
	usage: '${PREFIX}radio <Station>',
};
