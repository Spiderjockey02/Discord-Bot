//When an emoji has been created in a server
const Discord = require('discord.js')

function sendMessage(newGuild, settings, embed) {
  var channel = newGuild.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
  if (!channel) return
  channel.send(embed);
}
module.exports = async (bot, oldGuild, newGuild) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(newGuild.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if ModLog plugin is active
  if (settings.ModLog == false) return
  //Check if event channelDelete is for logging
  if (settings.ModLogEvents.includes('GUILDUPDATE')) {
    //guild name change
    if (oldGuild.name != newGuild.name) {
      var embed = new Discord.MessageEmbed()
        .setDescription(`**Server name changed**`)
        .setAuthor(newGuild.name, newGuild.iconURL())
        .addField("Before:", oldGuild.name)
        .addField("After:", newGuild.name)
        .setTimestamp()
      sendMessage(newGuild, settings, embed)
    }
    //region change
    if (oldGuild.region != newGuild.region) {
      var embed = new Discord.MessageEmbed()
        .setDescription(`**Server region changed**`)
        .setAuthor(newGuild.name, newGuild.iconURL())
        .addField("Before:", oldGuild.region)
        .addField("After:", newGuild.region)
        .setTimestamp()
      sendMessage(newGuild, settings, embed)
    }
  }
  //log event in console
  bot.logger.log(`Guild: ${newGuild.name} has been updated.`);
};
