const Discord = require('discord.js')
module.exports = async (bot, role) => {
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(role.guild)
  } catch (e) {
    console.log(e)
  }
  //Check if moderation plugin is on
  if (settings.ModLog == false) return
  //Check if moderation channel is valid
  if (role.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)) {
    var RoleEmbed = new Discord.MessageEmbed()
    .setColor(3066993)
    .setAuthor("~Role Created~")
    .addField("Role name", role.name, true)
    .addField("Role ID", role.id, true)
    .addField("Users in role", role.members.size, true)
    .addField("Mentionable", role.mentionable, true)
    .addField("Displayed separately", role.hoist, true)
    .addField("Color", role.color, true)
    .setTimestamp()
    role.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send({ embed: RoleEmbed });
  }
  bot.logger.log(`Role: ${role.name} has been created in Server: ${role.guild.id}`);
};
