module.exports = async (bot, error) => {
  //LOG error event
  bot.logger.log(`An error event was sent by Discord.js: ${error.message}`, "error");
};
