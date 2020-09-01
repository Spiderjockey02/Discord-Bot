var radios = require('../../storage/resources/radiostations.json')
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
	//Show a list of radio stations
	if (args[0].toLowerCase() == 'list') {
		let resp = ''
		console.log(radios)
		console.log(radios.length)
		for (var i = 0; i < radios.length; i++) {
			resp += `${i+1}.) \`${radios[i].name}\`\n`
		}
		resp += `\n**Choose a number between \`1-${radios.length}\` or \`cancel\`**`;
		message.channel.send(resp)
	} else {
		//Play a radio station
		for (var i = 0; i < radios.length; i++) {
			if (radios[i].name == args[0].toUpperCase()) {
				message.channel.send("Radio station found")
				let fetched = ops.active.get(message.guild.id);
				if (!fetched) {
					message.member.voice.channel.join().then((connection, radios) => {
						console.log(radios[i])
						const dispatcher = connection.play(`${radios[i].url}`);
						dispatcher.on('end', end => connection.leave())
					})
				}
			} else if (i == radios.length) {
				message.channel.send("NONE FOUND")
				return
			}
		}

	}
	//if (!args[0] || radios[args[0].toUpperCase()].url == undefined) {
		//message.channel.send("Please provide me with a radio station").then(m => m.delete({ timeout: 3500 }))
		//message.delete()
		//return
	//}
	//Check for radio stations
	//var VC = message.member.voice;
	//if (!VC) return message.reply("Please join a voice channel.")
	//VC.channel.join().then(connection => {
		//const dispatcher = connection.play(`${radios[args[0].toUpperCase()].url}`);
		//dispatcher.on('end', end => VC.leave());
	//}).catch(console.error);
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
