module.exports.run = async (bot, message, args, settings) => {
  //get user for warning
  let wUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
  if (!wUser) {
		message.delete()
		message.channel.send("`Can't find user!`").then(m => m.delete({ timeout: 3500 }))
		return
	}
  let wReason = (args.join(" ").slice(22)) ? args.join(" ").slice(22) : "No reason given"
  //Check to see if user has right permisisons
	if (!message.member.hasPermission("KICK_MEMBERS") || wUser.hasPermission("KICK_MEMBERS")) {
		message.delete()
		message.channel.send("`You are unable to warn this person.`").then(m => m.delete({ timeout: 3500 }))
		return
	}
  bot.warning(message, wUser, wReason, settings)
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
