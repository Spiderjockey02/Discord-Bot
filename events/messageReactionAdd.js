//When a message is deleted
module.exports = (bot, messageReaction, user) => {
  //LOG messageDeleteBulk event
  if (user.bot) return
  if (messageReaction.message.channel.id == '750750147310256139') {
    //Get role and give to user
    var role = messageReaction.message.channel.guild.roles.cache.find(role => role.name == 'Users')
    var user = messageReaction.message.channel.guild.member(user)
    user.roles.add(role).catch(e => bot.logger.error(e))
    bot.logger.log(`${user.username} added to server`)
  }
}
