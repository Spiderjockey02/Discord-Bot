const Discord = require('discord.js')
const Ranks = require('../../modules/models/levels')
module.exports.run = async (bot, message, args, settings) => {
  if (settings.LevelPlugin == false) {
    if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.`}}).then(m => m.delete({ timeout: 10000 }))
    return;
  }
  Ranks.find({
    guildID: message.guild.id
  }).sort([
    ['Xp', 'descending']
  ]).exec((err, res) => {
    if (err) console.log(err)
    var embed = new Discord.MessageEmbed()
    .setTitle("Leaderboard")
    if (res.length === 0) {
      //If there no results
      embed.setColor()
      embed.addField("No data found", "Please type in chat to gain experience.")
    } else if (res.length < 10) {
      //less than 10 results
      for (var i = 0; i < res.length; i++) {
        let name = message.guild.members.get(res[i].userID) || "User left"
        if (name == "User left") {
          embed.addField(`${i + 1}. ${name}`, `**XP:** ${res[i].Xp}`)
        } else {
          embed.addField(`${i + 1}. ${name.user.username}`, `**XP:** ${res[i].Xp}`)
        }
      }
    } else {
      //more than 10 results
      for (var i = 0; i < 10; i++) {
        let name = message.guild.members.get(res[i].userID) || "User left"
        if (name == "User left") {
          embed.addField(`${i + 1}. ${name}`, `**XP:** ${res[i].Xp}`)
        } else {
          embed.addField(`${i + 1}. ${name.user.username}`, `**XP:** ${res[i].Xp}`)
        }
      }
    }
    message.channel.send(embed)
  })
}
module.exports.config = {
	command: "leaderboard",
  aliases: ["lb", "levels"]
}
module.exports.help = {
	name: "Leaderboard",
	category: "Levels",
	description: "Displays the Level leaderboard",
	usage: '!leaderboard',
}
