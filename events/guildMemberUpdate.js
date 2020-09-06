//When a guild member's account updates
const Discord = require('discord.js')

function sendMessage(newMember, settings, embed, bot) {
  var channel = newMember.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
  if (channel) channel.send(embed);
  //log event in console
  bot.logger.log(`Guild member: ${newMember.user.username} has been updated in Server: [${newMember.guild.id}].`);
}
module.exports = async (bot, oldMember, newMember) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(newMember.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if ModLog plugin is active
  if (settings.ModLog == false) return
  //Check if event channelCreate is for logging
  if (settings.ModLogEvents.includes('GUILDMEMBERUPDATE')) {
    //nickname change
    if (oldMember.nickname != newMember.nickname) {
      var embed = new Discord.MessageEmbed()
        .setDescription(`**${newMember.toString()} nickname changed**`)
        .setFooter(`ID: ${newMember.id}`)
        .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
        .addFields(
          { name: 'Before:', value: `${oldMember.nickname ? oldMember.nickname : '*None*'}`, inline: true },
          { name: 'After:', value: `${newMember.nickname ? newMember.nickname : '*None*'}`, inline: true })
        .setTimestamp()
      //Send message
      sendMessage(newMember, settings, embed, bot)
    }
    //look for role change
    let rolesAdded = newMember.roles.cache.filter(x => !oldMember.roles.cache.get(x.id));
    let rolesRemoved = oldMember.roles.cache.filter(x => !newMember.roles.cache.get(x.id));
    if (rolesAdded.size != 0 || rolesRemoved.size != 0) {
      let roleAddedString = ''; // which roles were added from the member
      for (const role of rolesAdded.array()) {
        roleAddedString += role.toString();
      }
      let roleRemovedString = ''; // which roles were removed from the member
      for (const role of rolesRemoved.array()) {
          roleRemovedString += role.toString();
      }
      var embed = new Discord.MessageEmbed()
        .setDescription(`**${newMember.toString()} roles changed**`)
        .setFooter(`ID: ${newMember.id}`)
        .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
        .addFields(
          { name: `Added role [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? '*None*' : roleAddedString}`, inline: true },
          { name: `Removed Roles [${rolesRemoved.size}]:`,  value: `${roleRemovedString.length == 0 ? '*None*' : roleRemovedString}`, inline: true })
        .setTimestamp()
        //Send message
        sendMessage(newMember, settings, embed, bot)
    }
  }
};
