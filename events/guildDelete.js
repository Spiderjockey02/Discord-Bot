//When the bot leaves a guild
module.exports = async (bot, guild) => {
  bot.logger.cmd(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`, 'log');
  //Delete server settings
  await bot.DeleteGuild(guild)
};
