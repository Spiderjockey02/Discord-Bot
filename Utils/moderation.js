module.exports = {
  //Moderation
  moderation(message, settings) {
    if (message.author.bot) return
    //check for bad words
    words =  message.content.split(' ')
    if (words.some(r => settings.ModerationBadwordList.includes(r))) {
      //badword detected
      if (message.author.roles.some(r => settings.ModerationBadwordRole.includes(r))) {
        //role
        if (message.channel.id == settings.ModerationBadwordChannel) {
          console.log("You bad")
        }
      }
    }
  }
}
