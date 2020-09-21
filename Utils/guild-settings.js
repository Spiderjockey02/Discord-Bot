//guild settings

const fs = require('fs')
const Discord = require('discord.js')
const { Guild } = require('../modules/database/models')
const mongoose = require('mongoose')

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
};
