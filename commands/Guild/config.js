const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
  //Makes sure user only has MANAGE_GUILD or ADMINISTRATOR
  if (!message.member.hasPermission("MANAGE_GUILD")) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`MANAGE_GUILD\`.`}}).then(m => m.delete({ timeout: 10000 }))
    return
	}
  console.log(settings)
  if (!args.length) {
    //show all available options
    console.log(`Show help`)
    return
  }
  if (!args[1]) {
    //show what the option is currently e.g !config welcomePlugin would reply with `welcomePLugin: true` meaning its enabled
    message.channel.send(`${args[0]}: ${settings[`${args[0]}`]}`)
  }
  //This is where the option will be validated and then send the update to the database
  if (settings.hasOwnProperty(`${args[0]}`)) {
    console.log("YEAH")
  }
}
module.exports.config = {
	command: "config",
	aliases: ["config"]
}
module.exports.help = {
	name: "Config",
	category: "Guild",
	description: "",
	usage: '!config {option} [entry]',
}
