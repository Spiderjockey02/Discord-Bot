//When an emoji has been deleted in a server
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
    .setColor(15158332)
    .setAuthor("~Emoji deleted~")
    .addField("Emoji name", emoji.name, true)
    .addField("Emoji ID", emoji.id, true)
    .addField("Emoji animated", emoji.animated)
    .setTimestamp()
    emoji.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send({ embed: EmojiEmbed });
  }
  bot.logger.log(`Emoji: ${emoji.name} has been deleted in Server: ${emoji.guild.id}`);
};
