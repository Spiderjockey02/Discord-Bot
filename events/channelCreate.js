//When a channel has been created in a server
const Discord = require('discord.js')
module.exports = async (bot, channel) => {
  //Make sure its not a DM message
  if (channel.type == 'dm') return
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(channel.guild)
  } catch (e) {
    console.log(e)
  }
  if (settings.ModLog == false) return
  //Check if moderation channel is valid
  if (channel.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)) {
    console.log(channel)
    var RoleEmbed = new Discord.MessageEmbed()
    .setColor(3066993)
    .setAuthor("~Channel Created~")
    .addField("Channel name:", channel.name, true)
    .addField("Channel ID:", channel.id, true)
    .addField("Channel type:", channel.type, true)
    .addField("Position:", channel.rawPosition, true)
    .addField("NSFW:", channel.nsfw, true)
    //Check audit logs for creator of channel
    .setTimestamp()
    channel.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send({ embed: RoleEmbed });
  }
  //Log event in console
  bot.logger.log(`Channel: ${channel.name} has been created in Server: ${channel.guild.id}`);
};
