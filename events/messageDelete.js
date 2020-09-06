//When an emoji has been created in a server
const Discord = require('discord.js')
module.exports = async (bot, message) => {
  //Make sure the message wasn't deleted in a Dm channel
  if (message.channel.type == 'dm') return
  //If someone leaves the server and the server has default discord messages, it gets removed but says message content is null (Don't know why)
  if (!message.content) return
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(message.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if ModLog plugin is active
  if (settings.ModLog == false) return
  //Check if event channelDelete is for logging
  if (settings.ModLogEvents.includes('MESSAGEDELETE')) {
    // shorten message if it's longer then 1024
    let shortened = false;
    let content = message.content;
    if (content.length > 1024) {
        content = content.slice(0, 1020) + '...';
        shortened = true;
    }
    var embed = new Discord.MessageEmbed()
      .setDescription(`**Message from ${message.author.toString()} deleted in ${message.channel.toString()}**`)
      .setFooter(`Author: ${message.author.id} | Message: ${message.id}`)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .addField(`Content ${shortened ? ' (shortened)' : ''}:`, `${message.content.length > 0 ? content : '*no content*'}`)
      .setTimestamp()
    //send message
    var channel = message.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
    if (channel) {
      channel.send(embed);
    }
  }
  //log event in console
  bot.logger.log(`Message by: ${message.author.username} has been deleted in server: [${message.guild.id}]`);
};
