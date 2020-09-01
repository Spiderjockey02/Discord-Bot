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
  bot.moderation = async (message, settings) => {
    if (message.author.bot) return
    //Make sure they dont have ADMINISTRATOR permission
    const found = message.member._roles.some(r => settings.ModeratorRoles.includes(r))
    if (!found) return
    //Check if it breaks any rules
    //Check for bad words
    if (settings.ModerationBadwords >= 1) {
      x = message.content.toLowerCase().split(" ")
      settings.ModerationBadwordList.forEach(item => {
        if (x.includes(item)) {
          bot.logger.log(`${message.author} was flagged for: Bad words.`)
          punishment(message, "Bad word usage", settings.ModerationBadwords, bot)
          return
        }
      })
    }
    //Check for repeated text
    if (settings.ModerationRepeatedText >= 1) {
      const IgnoredRole = message.member._roles.some(r => settings.ModerationRepeatedTextRole.includes(r))
    }
    //check for server invites
    if (settings.ModerationServerInvites >= 1) {
      if (message.content.includes('discord.gg/' || 'discordapp.com/invites')) {
        //Message included a server invite
        if (!message.member._roles.some(r => settings.ModerationServerInvitesRole.includes(r))) {
          //The user does not have an ignored role
          if (!settings.ModerationServerInvitesChannel.includes(message.channel.id)) {
            //message channel is not on the ignored list.
            bot.logger.log(`${message.author} was flagged for: Server invite.`)
            punishment(message, "Server invite", settings.ModerationServerInvites, bot)
            return
          }
        }
      }
    }
    //Check for external links
    if (settings.ModerationExternalLinks >= 1) {
      var regx = /(https?:\/\/[^\s]+)/g;
      if (regx.test(message.content.toLowerCase().replace(/\s+/g, ''))) {
        if (!message.member._roles.some(r => settings.ModerationExternalLinksRole.includes(r))) {
          if (!settings.ModerationExternalLinksChannel.includes(message.channel.id)) {
            bot.logger.log(`${message.author} was flagged for: External links`)
            punishment(message, "External link", settings.ModerationExternalLinks, bot)
            return
          }
        }
      }
    }
    //Check for spammed caps
    if (settings.ModerationSpammedCaps >= 1) {
      var x = message.content.replace(/[^A-Z]/g, "").length
      if (Math.round((x/message.content.length)*100, 2) > 60 && message.content.length >= 30) {
        if (!message.member._roles.some(r => settings.ModerationSpammedCapsRole.includes(r))) {
          if (!settings.ModerationSpammedCapsChannel.includes(message.channel.id)) {
            bot.logger.log(`${message.author} was flagged for: Spammed caps`)
            punishment(message, "Spammed caps", settings.ModerationSpammedCaps, bot)
            return
          }
        }
      }
    }
    //check for spammed emojis
    if (settings.ModerationExcessiveEmojis >= 1) {
      var x  = message.content.replace(/[\u1f600-\u1f64f]/g, "").length
      if (Math.round((x/message.content.length)*100, 2) > 60 && message.content.length >= 15) {
        if (!message.member._roles.some(r => settings.ModerationExcessiveEmojisRole.includes(r))) {
          if (!settings.ModerationExcessiveEmojisChannel.includes(message.channel.id)) {
            bot.logger.log(`${message.author} was flagged for: Excessive emojis`)
            punishment(message, "Excessive emojis", settings.ModerationExcessiveEmojis, bot)
            return
          }
        }
      }
    }
    //check for mass spoilers
    if (settings.ModerationMassSpoilers >= 1) {
      return
    }
    //check for mass mentions
    if (settings.ModerationMassMention >= 1) {
      if (message.mentions.users.size >= 3) {
        if (!message.member._roles.some(r => settings.ModerationMassMentionRole.includes(r))) {
          if (!settings.ModerationMassMentionChannel.includes(message.channel.id)) {
            bot.logger.log(`${message.author} was flagged for: Mass mentions`)
            punishment(message, "Mass mentions", settings.ModerationMassSpoilers, bot)
            return
          }
        }
      }
    }
    //check for 'Zalgo'
    if (settings.ModerationZalgo >= 1) {
      return
    }
  }
};
