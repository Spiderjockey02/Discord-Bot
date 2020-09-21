const Discord = require('discord.js')
const Ranks = require('../../modules/database/models/levels')
module.exports.run = async (bot, message, args, settings) => {
  if (settings.LevelPlugin == false) {
    if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.`}}).then(m => m.delete({ timeout: 10000 }))
    return
  }
  //get user details
  user = message.mentions.users.first()
  if (!user) {
    user = message.author
  } else {
    user = user
  }
  Ranks.findOne({
    userID: user.id,
    guildID: message.guild.id
  }, (err, Xp) => {
    if(err) console.log(err)
    var embed = new Discord.MessageEmbed()
    .setAuthor(user.username)
    if (Xp == null) {
      embed.addField("Xp:", "0", true)
      embed.addField("Level:", "1", true)
      embed.setFooter(`50 XP till level up`, user.displayAvatarURL())
    } else {
      embed.addField("Xp:", Xp.Xp, true)
      embed.addField("Level:", Xp.Level, true)
      embed.setFooter(`${(Xp.Level*50)-Xp.Xp} XP till level up`, message.author.displayAvatarURL())
    }
    message.channel.send(embed)
  })
}
module.exports.config = {
	command: "level",
	aliases: ["lvl","rank"]
}
module.exports.help = {
	name: "Level",
	category: "Levels",
	description: "Shows your rank/Level",
	usage: '!level [username - optional]',
}
