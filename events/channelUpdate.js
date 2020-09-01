//When an emoji has been created in a server
const Discord = require('discord.js')
module.exports = async (bot, channel) => {
  bot.logger.log(`Channel: ${channel.name} has been updated in Server: ${channel.guild.id}`);
};
