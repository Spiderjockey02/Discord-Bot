const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
	//Check if user can mute users
	if (!message.member.hasPermission("MUTE_MEMBERS")) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`MUTE_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
	//check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MANAGE_ROLES\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}]`)
		return
	}
	//Check if bot can mute users
	if (!message.guild.me.hasPermission("MUTE_MEMBERS")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MUTE_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}]`)
		return
	}
  //find user
	let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
	if (!user) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
	//remove role
	try {
		var role = message.guild.roles.cache.find(role => role.name == settings.MutedRole)
		user.roles.remove(role)
		if (user.voice.channelID) {
			user.voice.setMute(false)
		}
	} catch (e) {
		bot.logger.log(e)
	}
	message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} *${user.user.username}#${user.user.discriminator} was successfully unmuted*.`}}).then(m => m.delete({ timeout: 3000 }))
}
module.exports.config = {
	command: "unmute",
  aliases: ["unmute"]
}
module.exports.help = {
	name: "Unmute",
	category: "Guild",
	description: "Unmutes a user",
	usage: '!unmute {user} [reason] {time}',
}
