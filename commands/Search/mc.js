const ping = require('minecraft-server-util')
const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
	//Ping a minecraft server
	if(!args[0]) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('mc').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	r = await message.channel.send("Pinging server..");
	//If no ping use 25565
	if(!args[1]) {
		args[1] = "25565";
	}
	ping(args[0], parseInt(args[1]), (error, response) => {
		if(error) {
			r.delete();
			message.delete()
			message.channel.send({embed:{description:"**The server did not respond in time.**"}}).then(m => m.delete({ timeout: 4500 }))
			return;
		}
		var embed = new Discord.MessageEmbed()
		.setColor(0x0099ff)
		.setTitle('Server Status')
		.setURL(`https://mcsrvstat.us/server/${args[0]}:${args[1]}`)
		.addField('Server IP:', response.host)
		.addField('Server Version:', response.version)
		.addField('Description:', response.descriptionText)
		.addField('Online Players', `${response.onlinePlayers}/${response.maxPlayers}`)
		r.delete()
    message.channel.send(embed)
	})
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
