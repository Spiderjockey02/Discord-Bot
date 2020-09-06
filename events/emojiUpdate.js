//When an emoji has been updated in a server
const Discord = require('discord.js')
module.exports = async (bot, oldEmoji, newEmoji) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(newEmoji.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if moderation plugin is on
  if (settings.ModLog == false) return
  //Check if moderation channel is valid
  if (settings.ModLogEvents.includes('EMOJIUPDATE')) {
    var embed = new Discord.MessageEmbed()
      .setColor(15105570)
      .setAuthor("~Emoji updated~")
      .addField("Emoji name", newEmoji.name, true)
      .addField("Emoji ID", newEmoji.id, true)
      .addField("Emoji animated", newEmoji.animated, true)
      .addField("Emoji preview", `<:${newEmoji.name}:${newEmoji.id}>`)
      .setTimestamp()
    //send message
    var channel = newEmoji.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
    if (channel) {
      channel.send(embed)
    }
  }
  bot.logger.log(`Emoji: ${newEmoji.name} has been updated in Server: ${newEmoji.guild.id}`);
};
