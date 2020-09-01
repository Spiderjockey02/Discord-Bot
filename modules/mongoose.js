const mongoose = require('mongoose')

module.exports = {
  init: (bot) => {
    const dbOptions = {
      useNewUrlParser: true,
      autoIndex: false,
      poolSize: 5,
      connectTimeoutMS: 10000,
      family: 4,
      useUnifiedTopology: true
    };
    mongoose.connect('mongodb://localhost:27017/database', dbOptions)
    mongoose.set('useFindAndModify', false)
    mongoose.Promise = global.Promise
    mongoose.connection.on('connected', () => {
      bot.logger.log('Mongoose connection successfully opened', "ready")
    });
    mongoose.connection.on('err', () => {
      bot.logger.log(`Mongoose connection error: \n ${err.stack}`, "error")
    });
    mongoose.connection.on('disconnected', () => {
      bot.logger.log('Mongoose disconnected', "error")
    });
  }
}
