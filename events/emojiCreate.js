//When an emoji has been created in a server
const Discord = require('discord.js')
module.exports = async (bot, emoji) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(emoji.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if moderation plugin is on
  if (settings.ModLog == false) return
  //Check if moderation channel is valid
  if (emoji.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)) {
    var EmojiEmbed = new Discord.MessageEmbed()
    .setColor(3066993)
    .setAuthor("~Emoji Created~")
    .addField("Emoji name", emoji.name, true)
    .addField("Emoji ID", emoji.id, true)
    .addField("Emoji animated", emoji.animated, true)
    .addField("Emoji preview", `<:${emoji.name}:${emoji.id}>`)
    .setTimestamp()
    emoji.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send({ embed: EmojiEmbed });
  }
  bot.logger.log(`Emoji: ${emoji.name} has been created in Server: ${emoji.guild.id}`);
};
