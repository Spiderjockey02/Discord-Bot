module.exports.run = async (bot, message, args, settings) => {
  //Deletes their (!clear {x}) message
  if (message.deletable) message.delete();
  if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`MANAGE_MESSAGES\` to run this command.`}}).then(m => m.delete({ timeout: 15000 }))
    return;
  }
	//Make sure bot can delete other peoples messages
	if (!message.channel.permissionsFor(bot.user).has("MANAGE_MESSAGES")) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MANAGE_MESSAGES\`.`}}).then(m => m.delete({ timeout: 15000 }))
		bot.logger.error(`Missing permission: \`MANAGE_MESSAGES\` in [${message.guild.id}]`)
    return;
	}
	//Make sure the bot can see other peoples' messages
	if (!message.channel.permissionsFor(bot.user).has("MANAGE_MESSAGES")) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`READ_MESSAGE_HISTORY\`.`}}).then(m => m.delete({ timeout: 15000 }))
		bot.logger.error(`Missing permission: \`READ_MESSAGE_HISTORY\` in [${message.guild.id}]`)
    return;
	}
  //Check some things
  const amount = args.join(" ")
	//Make something was entered after `!clear`
  if (!amount) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('clear').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	//MAke sure x is a number
	if (isNaN(amount) || (amount > 100) || (amount < 1)) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('clear').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
		return
	}
	await message.channel.messages.fetch({limit: amount}).then(messages => {
		message.channel.bulkDelete(messages)
		message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} ${messages.size} messages were successfully deleted.`}}).then(m => m.delete({ timeout: 3000 }))
	})
}
module.exports.config = {
	command: "clear",
  aliases: ["cl"]
}
module.exports.help = {
	name: "Clear",
	category: "Guild",
	description: "Clears a certain amount of messages.",
	usage: '!clear [Number(max 100)]',
}
