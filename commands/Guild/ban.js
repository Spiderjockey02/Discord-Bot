const Discord = require('discord.js')
const { Permissions } = require('discord.js');
module.exports.run = async (bot, message, args, settings) => {
	//Check if user has permission to ban user
	if (message.deletable) message.delete()
	if (!message.member.hasPermission("BAN_MEMBERS")) {
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`BAN_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
	//Check if bot has permission to ban user
	if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`BAN_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}]`)
		return
	}
	//Get user and reason
	let banned = message.mentions.users.first() || bot.users.resolve(args[0])
	let reason = (args.join(" ").slice(22)) ? args.join(" ").slice(22) : "No reason given"
	//Make sure user is real
	if (!banned) {
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
	//Ban user with reason
	message.guild.member(banned).ban({ reason: reason })
	message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.cross} *${banned.username}#${banned.discriminator} was successfully banned*.`}}).then(m => m.delete({ timeout: 8000 }))
}
module.exports.config = {
	command: "ban",
	aliases: ["ban"]
}
module.exports.help = {
	name: "Ban",
	category: "Guild",
	description: "Ban a user.",
	usage: `!ban {user} [reason]`,
}
