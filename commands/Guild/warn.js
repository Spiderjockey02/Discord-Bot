module.exports.run = async (bot, message, args, settings) => {
  //get user for warning
  if (message.deletable) message.delete()
  //Check to see if user has right permisisons
	if (!message.member.hasPermission("KICK_MEMBERS")) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`KICK_MEMBERS\`.`}}).then(m => m.delete({ timeout: 10000 }))
		return
	}
  //get user to warn
  let wUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]))
  if (!wUser) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.`}}).then(m => m.delete({ timeout: 10000 }))
		return
	}
  //make sure that the user that is getting warned has administrator permissions
  if (wUser.hasPermission("ADMINISTRATOR")) {
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am unable to warn this user.`}}).then(m => m.delete({ timeout: 10000 }))
		return
  }
  //get reason for warning
  let wReason = (args.join(" ").slice(22)) ? args.join(" ").slice(22) : "No reason given"
  //Warning is sent to warning manager
  require('../../modules/warning').run(bot, message, wUser, wReason, settings)
}
module.exports.config = {
	command: "warn",
  aliases: ["warning"]
}
module.exports.help = {
	name: "Warning",
	category: "Guild",
	description: "Warns a user",
	usage: '!warn {user} [reason]',
}
