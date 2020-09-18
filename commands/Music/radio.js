//get radios
var radio = require('../../storage/resources/radiostations.json')

module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.`}}).then(m => m.delete({ timeout: 10000 }))
		return;
	}
	//Check if user is in a voice channel
	if (!message.member.voice) {
		message.channel.send({embed:{color:15158332,description:"Please connect to a voice channel."}}).then(m => m.delete({ timeout: 3500 }))
		message.delete()
		return
	}
	//Check if bot can join channel
  if (!message.guild.me.hasPermission("CONNECT")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`CONNECT\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}]`)
		return
	}
  //Check if bot can speak in channel
  if (!message.guild.me.hasPermission("SPEAK")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`SPEAK\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}]`)
		return
	}

	//Make sure an entry was included
	if (args.length == 0) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('radio').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	if (args[0].toLowerCase() == 'list') {
		console.log(radio)
		console.log(radio.length)
		console.log(radio.size)
	}
}
module.exports.config = {
	command: "radio",
	aliases: ["radio"]
}
module.exports.help = {
	name: "radio",
	category: "Music",
	description: "Plays the radio, do !radio list to show available stations",
	usage: '!radio [Radio Station]',
}
