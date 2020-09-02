const fs = require('fs')
const Discord = require('discord.js')
const { Guild, Ranks, Warning } = require('./models')
const mongoose = require('mongoose')

//Punishment
function punishment(message, tag, settings, bot) {
  if (settings == 1) {
    //delete message
    message.delete()
  } else if (settings == 2) {
    //warn member
    Automod(message, tag, bot)
  } else if (settings == 3) {
    //delete message and warn member
    Automod(message, tag, bot)
    message.delete()
  } else {
    //I dont know
    bot.logger.log(`${settings} resulted in not a number from 0-3`)
  }
}
function Automod(message, tag, bot) {
  var embed = new Discord.RichEmbed()
  .setAuthor(`[WARN] ${message.author.username}#${message.author.discriminator}`, `${(bot.user.avatar) ? `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${bot.user.discriminator % 5}.png`}`)
  .setDescription(`Reason: ${tag}`)
  message.channel.send(embed).then(m => m.delete(10000))
  bot.logger.log(`${message.author} was warned for: ${tag}`)
}
module.exports = bot => {
  //Get guild settings
  bot.getGuild = async (guild) => {
    let data = await Guild.findOne({guildID: guild.id});
    if (data) return data
    else return bot.config.defaultSettings
  };
  //update guild settings
  bot.updateGuild = async (guild, settings, bot) => {
    let data = await bot.getGuild(guild)

    if (typeof data !== 'object') data = {}
    for (const key in settings) {
      if (settings.hasOwnProperty(key)) {
        if (data[key] !== settings[key]) data[key] = settings[key]
        else return
      }
    }
    bot.logger.log(`Guild: [${data.guildID}] updated settings: ${Object.keys(settings)}`)
    return await data.updateOne(settings)
  };
  //when the bot joins add guild settings to server
  bot.CreateGuild = async (settings) => {
    let merged = Object.assign({_id: mongoose.Types.ObjectId()}, settings)
    const newGuild = await new Guild(merged)
    return newGuild.save()
  };
  //Delete guild from server when bot leaves server
  bot.DeleteGuild = async (guild) => {
    let data = await Guild.findOne({guildID: guild.id});
    Guild.deleteOne(data, function(err, obj) {
      if (err) throw err
    })
    return
  };
  //Level up system
  bot.level = async (message, settings) => {
    let xpAdd = Math.floor(Math.random() * 7) + 8
    //console.log(`XP: ${xpAdd}`)
    Ranks.findOne({
      userID: message.author.id,
      guildID: message.guild.id
    }, (err, Xp) => {
      if(err) console.log(err)
      if(!Xp) {
        const newXp = new Ranks({
          userID: message.author.id,
          guildID: message.guild.id,
          Xp: xpAdd,
          Level: 1
        })
        newXp.save().catch(e => console.log(e))
      } else {
        Xp.Xp = Xp.Xp + xpAdd
        //Look for level update
        if (Xp.Xp >= Xp.Level*50) {
          Xp.Level = Xp.Level + 1
          message.channel.send(settings.LevelMessage.replace('{user}', message.author).replace('{level}', Xp.Level))
        }
        Xp.save().catch(e => console.log(e))
      }
    })
  };
  bot.warning = async (message, wUser, wReason, settings) => {
    Warning.findOne({
      userID: wUser.user.id,
      guildID: message.guild.id
    }, async (err, res) => {
      if (err) console.log(err)
      if (!res) {
        const newWarn = new Warning({
          userID: wUser.user.id,
          guildID: message.guild.id,
          Warnings: 1
        })
        newWarn.save().catch(e => console.log(e))
        await wUser.send(`You got warned in **${message.guild.name}** by ${message.author.username}\n Reason: \`${wReason}\``)
        var embed = new Discord.RichEmbed()
        .setColor(8359053)
        .setAuthor(`[WARN] ${wUser.user.username}#${wUser.user.discriminator} has been warned`, `${(wUser.user.avatar) ? `https://cdn.discordapp.com/avatars/${wUser.user.id}/${wUser.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${wUser.user.discriminator % 5}.png`}`)
        .setDescription(`**Reason:** ${wReason}`)
        message.channel.send(embed).then(m => m.delete(30000))
        if (settings.ModLog == true) {
          var embed = new Discord.RichEmbed()
          .setColor(15158332)
          .setAuthor(`[WARN] ${wUser.user.username}#${wUser.user.discriminator}`, `${(wUser.user.avatar) ? `https://cdn.discordapp.com/avatars/${wUser.user.id}/${wUser.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${wUser.user.discriminator % 5}.png`}`)
          .addField("User:", `${wUser}`, true)
          .addField("Moderator:", `<@${message.author.id}>`,true)
          .addField("Warnings:", '1', true)
          .addField("Reason:", wReason)
          .setTimestamp()
          let warnChannel = message.guild.channels.find(channel => channel.name == settings.ModLogChannel)
          if (warnChannel) warnChannel.send(embed)
        }
      } else {
        res.Warnings = res.Warnings + 1
        //if warnings is 2
        if (res.Warnings == 2) {
          //Mute user
          let muteRole = message.guild.roles.find(role => role.name === "Muted")
          let muteTime = 300000 //5 minutes
          //Send message to warned user
          await wUser.send(`You got warned in **${message.guild.name}** by ${message.author.username}\n Reason: \`${wReason}\``)
          await(wUser.addRole(muteRole))
          //Send response to moderator
          var embed = new Discord.RichEmbed()
          .setColor(8359053)
        	.setAuthor(`[WARN] ${wUser.user.username}#${wUser.user.discriminator} has been warned`, `${(wUser.user.avatar) ? `https://cdn.discordapp.com/avatars/${wUser.user.id}/${wUser.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${wUser.user.discriminator % 5}.png`}`)
        	.setDescription(`**Reason:** ${wReason}`)
          message.channel.send(embed).then(m => m.delete(30000))
          if (settings.ModLog == true) {
            var embed = new Discord.RichEmbed()
          	.setColor(15158332)
          	.setAuthor(`[WARN] ${wUser.user.username}#${wUser.user.discriminator}`, `${(wUser.user.avatar) ? `https://cdn.discordapp.com/avatars/${wUser.user.id}/${wUser.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${wUser.user.discriminator % 5}.png`}`)
          	.addField("User:", `${wUser}`, true)
          	.addField("Moderator:", `<@${message.author.id}>`,true)
          	.addField("Warnings:", res.Warnings, true)
          	.addField("Reason:", wReason)
          	.setTimestamp()
          	let warnChannel = message.guild.channels.find(channel => channel.name == settings.ModLogChannel)
          	if (warnChannel) warnChannel.send(embed)
          }
          res.save().catch(e => console.log(e))
          //remove role after time
          setTimeout(() => {
            wUser.removeRole(muteRole).catch(e => console.log(e))
          }, muteTime)
        } else if (res.Warnings >= 3) {
          //if warnings is 3
          await wUser.send(`You got kicked from **${message.guild.name}** by ${message.author.username}\n Reason: \`Getting too many warnings\``)
          if (settings.ModLog == true) {
            var embed = new Discord.RichEmbed()
          	.setColor(15158332)
          	.setAuthor(`[KICK] ${wUser.user.username}#${wUser.user.discriminator}`, `${(wUser.user.avatar) ? `https://cdn.discordapp.com/avatars/${wUser.user.id}/${wUser.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${wUser.user.discriminator % 5}.png`}`)
          	.addField("User:", `${wUser}`, true)
          	.addField("Moderator:", `<@${message.author.id}>`,true)
          	.addField("Reason:",'Getting too many warnings' )
          	.setTimestamp()
          	let warnChannel = message.guild.channels.find(channel => channel.name == settings.ModLogChannel)
          	if (warnChannel) warnChannel.send(embed)
          }
          message.guild.member(wUser).kick(wReason)
          message.channel.send(`${wUser} was kicked for having too many warnings`).then(m => m.delete(3500))
          bot.logger.log(`<@${wUser.user.id}> was kicked from server: [${message.channel.guild.id}]`)
          //Delete user from database
          Warning.collection.deleteOne({userID: wUser.user.id, guildID: message.guild.id,})
        }
      }
    })
  }
};
