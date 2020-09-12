const util = require('minecraft-server-util')
const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
	//Ping a minecraft server
	if(!args[0]) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('mc').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	r = await message.channel.send("Pinging server..");
	//If no ping use 25565
	if(!args[1]) {
		args[1] = "25565";
	}
	util.ping(args[0], { port: parseInt(args[1]) }).then((response) => {
		var embed = new Discord.MessageEmbed()
			.setColor(0x0099ff)
			.setTitle('Server Status')
			.setURL(`https://mcsrvstat.us/server/${args[0]}:${args[1]}`)
			.addField('Server IP:', response.host)
			.addField('Server Version:', response.version)
			.addField('Description:', response.description.descriptionText)
			.addField('Online Players', `${response.onlinePlayers}/${response.maxPlayers}`)
		r.delete()
    message.channel.send(embed)
	}).catch((error) => {
		r.delete({ timeout: 1000 })
		message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} **No server with that IP was found in time.**`}}).then(m => m.delete({ timeout: 4500 }))
	});
}
module.exports.config = {
	command: "mc",
	aliases: ["minecraft"]
}
module.exports.help = {
	name: "Minecraft",
	category: "Search",
	description: "Gets information on a minecraft server",
	usage: '!mc [IP] [Port - Optional]',
}
