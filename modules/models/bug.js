const mongoose = require('mongoose')

const bugSchema = mongoose.Schema({
  guildID: String,
  guildName: String,
  userID: String,
  userName: String,
  reason: String
})

module.exports = mongoose.model('Bug', bugSchema)
