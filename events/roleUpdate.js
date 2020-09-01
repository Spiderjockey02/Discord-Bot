const Discord = require('discord.js')
module.exports = async (bot, oldRole, newRole) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(oldRole.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if moderation plugin is on
  if (settings.ModLog == false) return
  //Check if moderation channel is valid
  if (newRole.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)) {
    var RoleEmbed = new Discord.MessageEmbed()
    .setColor(15844367)
    .setAuthor("~Role updated~")
    .addField("Role name", newRole.name, true)
    .addField("Role ID", newRole.id, true)
    .addField("Users in role", newRole.members.size, true)
    .addField("Mentionable", newRole.mentionable, true)
    .addField("Displayed separately", newRole.hoist, true)
    .addField("Color", newRole.color)
    .setTimestamp()
    newRole.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send({ embed: RoleEmbed });
  }
  bot.logger.log(`Role: ${newRole.name} has been updated in Server: ${newRole.guild.id}`);
};
