const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
	//Check if user has deafen permission
	if (message.deletable) message.delete()
	if (!message.member.hasPermission("DEAFEN_MEMBERS")) {
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`DEAFEN_MEMBERS\` to run this command.`}}).then(m => m.delete({ timeout: 15000 }))
    return;
  }
	//Make sure bot can delete other peoples messages
	if (!message.guild.me.hasPermission("DEAFEN_MEMBERS")) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`DEAFEN_MEMBERS\`.`}}).then(m => m.delete({ timeout: 15000 }))
		bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}]`)
    return;
	}
	//Checks to make sure user is in the server
	let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
	if (!user) {
		message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.`}}).then(m => m.delete({ timeout: 10000 }))
		return
	}
	user.voice.setDeaf(false)
	message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} *${user.user.username}#${user.user.discriminator} was successfully undeafened*.`}}).then(m => m.delete({ timeout: 3000 }))
}
module.exports.config = {
	command: "undeafen",
  aliases: ["undeaf"]
}
module.exports.help = {
	name: "Undeafen",
	category: "Guild",
	description: "Undeafens a user",
	usage: '!undeafen {user} [reason] {time}',
}
