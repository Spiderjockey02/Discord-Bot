const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
	//Check if user has permission to ban user
	if (!message.member.hasPermission("KICK_MEMBERS")) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`KICK_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
	//Check if bot has permission to ban user
	if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`KICK_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`KICK_MEMBERS\` in [${message.guild.id}]`)
		return
	}
	//Get user and reason
	let kicked = message.mentions.users.first() || bot.users.resolve(args[0])
	let reason = (args.join(" ").slice(22)) ? args.join(" ").slice(22) : "No reason given"
	//Make sure user is real
	if (!kicked) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
	//kick user with reason
	message.guild.member(kicked).kick({ reason: reason })
	message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} *${kicked.username} was successfully kicked*.`}}).then(m => m.delete({ timeout: 3000 }))
}
module.exports.config = {
	command: "kick",
	aliases: ["kick"]
}
module.exports.help = {
	name: "Kick",
	category: "Guild",
	description: "Kicks a user.",
	usage: `!kick {user} [reason]`,
}
