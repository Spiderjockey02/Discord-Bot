//When a channel has been created in a server
const Discord = require('discord.js')

function sendMessage(newRole, settings, embed) {
  var channel = newRole.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
  if (!channel) return
  channel.send(embed);
}
module.exports = async (bot, oldRole, newRole) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(newRole.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if ModLog plugin is active
  if (settings.ModLog == false) return
  //Check if event channelDelete is for logging
  if (settings.ModLogEvents.includes('ROLEUPDATE')) {
    //role name change
    if (oldRole.name != newRole.name) {
      var embed = new Discord.MessageEmbed()
        .setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
        .setColor(15105570)
        .setFooter(`ID: ${newRole.id}`)
        .setAuthor(newRole.guild.name, newRole.guild.iconURL())
        .addField("Before:", oldRole.name)
        .addField("After:", newRole.name)
        .setTimestamp()
      sendMessage(newRole, settings, embed)
    }
    //role colour change
    if (oldRole.color != newRole.color) {
      var embed = new Discord.MessageEmbed()
        .setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
        .setColor(15105570)
        .setFooter(`ID: ${newRole.id}`)
        .setAuthor(newRole.guild.name, newRole.guild.iconURL())
        .addField("Before:", `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))`)
        .addField("After:", `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))`)
        .setTimestamp()
      sendMessage(newRole, settings, embed)
    }
    if (oldRole.permissions != newRole.permissions) {
      var embed = new Discord.MessageEmbed()
        .setDescription(`**Role permissions of ${newRole} (${newRole.name}) changed**\n[What those numbers mean](https://discordapp.com/developers/docs/topics/permissions)`)
        .setColor(15105570)
        .setFooter(`ID: ${newRole.id}`)
        .setAuthor(newRole.guild.name, newRole.guild.iconURL())
        .addField("Before:", oldRole.permissions.bitfield)
        .addField("After:", newRole.permissions.bitfield)
        .setTimestamp()
      sendMessage(newRole, settings, embed)
    }
  }
};
