//When a message is deleted
module.exports = (bot, messages) => {
  //LOG messageDeleteBulk event
  if (messages.size >= 10) {
      bot.logger.log(`[${messages.size}] messages have been deleted in server: ${messages.array()[0].channel.guild.id}`, "cmd");
  }
}
