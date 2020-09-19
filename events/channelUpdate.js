//When a channel gets updated
const Discord = require('discord.js')

//send message to log channel
function sendMessage(newChannel, settings, embed, bot) {
  //log event in console
  bot.logger.log(`Channel: ${newChannel.name} has been updated in Server: [${newChannel.guild.id}]`);
  //send message to channel
  var channel = newChannel.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
  if (channel) channel.send(embed);
}

module.exports = async (bot, oldChannel, newChannel) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(newChannel.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if ModLog plugin is active
  if (settings.ModLog == false) return
  //Check if event channelDelete is for logging
  if (settings.ModLogEvents.includes('CHANNELUPDATE')) {
    //Channel name change
    if (oldChannel.name != newChannel.name) {
      var embed = new Discord.MessageEmbed()
       .setDescription(`**${newChannel.type === 'category' ? "Category" : "Channel"} name changed of ${newChannel.toString()}**`)
       .setColor(15105570)
       .setFooter(`ID: ${newChannel.id}`)
       .setAuthor(newChannel.guild.name, newChannel.guild.iconURL())
       .addFields(
         { name: `Old:`, value: `${oldChannel.name}`, inline: true },
         { name: `New:`, value: `${newChannel.name}`, inline: true }
       )
       .setTimestamp()
      //send message
      sendMessage(newChannel, settings, embed)
    }
    //channel topic (description) change
    if (oldChannel.topic != newChannel.topic) {
      var embed = new Discord.MessageEmbed()
       .setDescription(`**${newChannel.type === 'category' ? "Category" : "Channel"} topic changed of ${newChannel.toString()}**`)
       .setColor(15105570)
       .setFooter(`ID: ${newChannel.id}`)
       .setAuthor(newChannel.guild.name, newChannel.guild.iconURL())
       .addFields(
         { name: `Old:`, value: `${oldChannel.topic ? oldChannel.topic : '*empty topic*'}`, inline: true },
         { name: `New:`, value: `${newChannel.topic ? newChannel.topic : '*empty topic*'}`, inline: true }
       )
       .setTimestamp()
      //send message
      sendMessage(newChannel, settings, embed)
    }
    //Check for permission change
    let permDiff = oldChannel.permissionOverwrites.filter(x => {
      if (newChannel.permissionOverwrites.find(y => y.allow.bitfield == x.allow.bitfield) && newChannel.permissionOverwrites.find(y => y.deny.bitfield == x.deny.bitfield)) {
        return false;
      }
      return true;
     }).concat(newChannel.permissionOverwrites.filter(x => {
       if (oldChannel.permissionOverwrites.find(y => y.allow.bitfield == x.allow.bitfield) && oldChannel.permissionOverwrites.find(y => y.deny.bitfield == x.deny.bitfield)) {
         return false
       }
       return true;
     }));
     if (permDiff.size) {
       var embed = new Discord.MessageEmbed()
         .setDescription(`**${newChannel.type === 'category' ? "Category" : "Channel"} permissions changed of ${newChannel.toString()}**\n*note:* check [docs](https://discordapp.com/developers/docs/topics/permissions) to see what the numbers mean`)
         .setColor(15105570)
         .setFooter(`ID: ${newChannel.id}`)
         .setAuthor(newChannel.guild.name, newChannel.guild.iconURL())
         .setTimestamp()
       for (const permID of permDiff.keys()) { // add a field for changed role or member
         // load both overwrites into variables
         let oldPerm = oldChannel.permissionOverwrites.get(permID) || {};
         let newPerm = newChannel.permissionOverwrites.get(permID) || {};
         let oldBitfields = {
           allowed: oldPerm.allow ? oldPerm.allow.bitfield : 0,
           denied: oldPerm.deny ? oldPerm.deny.bitfield : 0
         };
         let newBitfields = {
           allowed: newPerm.allow ? newPerm.allow.bitfield : 0,
           denied: newPerm.deny ? newPerm.deny.bitfield : 0
         };
         // load roles / guildmember for that overwrite
         var role;
         var member;
         if (oldPerm.type == 'role' || newPerm.type == 'role') {
           role = newChannel.guild.roles.cache.get(newPerm.id || oldPerm.id);
         }
         if (oldPerm.type == 'member' || newPerm.type == 'member') {
           member = await newChannel.guild.fetchMember(newPerm.id || oldPerm.id);
         }
         // make text about what changed
         let value = '';
         if (oldBitfields.allowed !== newBitfields.allowed) {
           value += `Allowed Perms: \`${oldBitfields.allowed}\` to \`${newBitfields.allowed}\`\n`;
         }
         if (oldBitfields.denied !== newBitfields.denied) {
           value += `Denied Perms: \`${oldBitfields.denied}\` to \`${newBitfields.denied}\``;
         }
         if (!value.length) value = 'Overwrite got deleted';
         // add field to embed
         embed.fields.push({
           "name": role ? role.name + ` (ID: ${role.id}):` : member.user.username + ` (ID: ${member.id}):`,
           "value": value
         });
       }
       sendMessage(newChannel, settings, embed)
     }
   }
};
