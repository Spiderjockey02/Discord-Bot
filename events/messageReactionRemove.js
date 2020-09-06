//When a reaction has been removed from a message in a server.
const Discord = require('discord.js')
module.exports = async (bot, reaction, user) => {
  //make sure it dosen't happen in a DM
  if (reaction.message.channel.type == 'dm') return
  //Make sure it's not a BOT
  if (user.bot) return
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(reaction.message.channel.guild)
  } catch (e) {
      console.log(e)
  }
  //record all reactions
  var embed = new Discord.MessageEmbed()
    .setDescription(`**${user.toString()} unreacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
    .setColor(15158332)
    .setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
    .setAuthor(user.tag, user.displayAvatarURL())
    .setTimestamp()
  //send message
  var channel = reaction.message.channel.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
  if (channel) {
    channel.send(embed)
  }
}
