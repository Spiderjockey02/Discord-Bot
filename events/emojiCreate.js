//When a emoji has been created
const Discord = require('discord.js')

module.exports = async (bot, emoji) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(emoji.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if ModLog plugin is active
  if (settings.ModLog == false) return
  //Check if event channelCreate is for logging
  if (settings.ModLogEvents.includes('EMOJICREATE')) {
    var embed = new Discord.MessageEmbed()
      .setDescription(`**Emoji: ${emoji} (${emoji.name}) was created**`)
      .setColor(3066993)
      .setFooter(`ID: ${emoji.id}`)
      .setAuthor(emoji.guild.name, emoji.guild.iconURL())
      .setTimestamp()
    //send message
    var channel = emoji.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
    if (channel) channel.send(embed)
    //log event in console
    bot.logger.log(`Emoji: ${emoji.name} has been created in Server: [${emoji.guild.id}].`);
  }
};
