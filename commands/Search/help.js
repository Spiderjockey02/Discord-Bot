//dependencies
const Discord = require('discord.js');
module.exports.run = async (bot, message, args, settings) => {
  //HElp command (find if they need general, command or plugin help)
  if (!args[0]) {
    //Shows plugin list
    var embed = new Discord.MessageEmbed()
    .setColor(0xffffff)
    .setTitle(`${bot.user.username}'s Plugin list.`)
    .addFields(
        { name: 'Fun', value: '!help fun', inline: true },
		    { name: 'Guild', value: '!help guild', inline: true },
		    { name: 'Levels', value: '!help levels', inline: true },
		    { name: 'Music', value: '!help music', inline: true },
		    { name: 'Search', value: '!help search', inline: true },
		    { name: 'Trivia', value: '!help trivia', inline: true },
	  )
    message.channel.send(embed)
  } else if (args.length <= 1) {
    //Shows plugin/command list
    //Check if it's a command
    let command = args[0]
    if (bot.commands.has(command)) {
      //Help on command
      command = bot.commands.get(command)
      if (command.help.category == "Host" && message.author.id != bot.config.ownerID) {
        //Make sure user isn't trying to access restricted commands
        if (message.deletable) message.delete()
        message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You do not have permissions to access this.`}}).then(m => m.delete({ timeout: 10000 }))
      }
      //SHow help on command
      var embed = new Discord.MessageEmbed()
      if (message.guild.icon) {
        embed.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
      }
      embed.setAuthor('Egglord HELP', message.guild.iconURL)
      embed.setDescription(`The bot prefix is: ${settings.prefix}\n\n**Command:** ${command.help.name}\n**Description:** ${command.help.description}\n**Usage:** ${command.help.usage.replace('!', settings.prefix)}`)
      message.channel.send(embed)
    } else {
      //Help on plugin
      var embed = new Discord.MessageEmbed()
      bot.commands.forEach(command => {
        if (command.help.category == args[0]) {
          embed.addField(command.help.usage, command.help.description)
        }
      });
      //Make sure it was a plugin
      if (embed.fields.length != 0) {
        message.channel.send(embed)
      } else {
        if (message.deletable) message.delete()
        message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to help you on that.`}}).then(m => m.delete({ timeout: 10000 }))
      }
    }
  } else {
    //Bot was unable to help user
    if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to help you on that.`}}).then(m => m.delete({ timeout: 10000 }))
  }
}
module.exports.config = {
	command: "help",
  aliases: ["help"]
}
module.exports.help = {
	name: "help",
	category: "Search",
	description: "Sends information about all the commands that I can do.",
	usage: '!help',
}
