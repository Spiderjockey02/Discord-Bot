const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
  if (message.author.id != bot.config.ownerID) return
  var embed = new Discord.MessageEmbed()
    .setTitle("Verify")
    .setDescription("Click the reaction below to access this server.")
  message.channel.send(embed).then(async function(message) {
    await message.react(`748984689779540110`)
  })
}
module.exports.config = {
	command: "verify",
  aliases: ["verify"]
}
module.exports.help = {
	name: "Verify",
	category: "Guild",
	description: "Allows access to the server.",
	usage: '!verify',
}
