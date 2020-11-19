const mongoose = require('mongoose');

module.exports = {
	init: (bot) => {
		const dbOptions = {
			useNewUrlParser: true,
			autoIndex: false,
			poolSize: 5,
			connectTimeoutMS: 10000,
			family: 4,
			useUnifiedTopology: true,
		};
		mongoose.connect(bot.config.MongoDBURl, dbOptions);
		mongoose.set('useFindAndModify', false);
		mongoose.Promise = global.Promise;
		mongoose.connection.on('connected', () => {
			bot.logger.log('Mongoose connection successfully opened', 'ready');
		});
		mongoose.connection.on('err', (err) => {
			bot.logger.error(`Mongoose connection error: \n ${err.stack}`);
		});
		mongoose.connection.on('disconnected', () => {
			bot.logger.error('Mongoose disconnected');
		});
	},
	async ping() {
		const currentNano = process.hrtime();
		await mongoose.connection.db.command({ ping: 1 });
		return require('../../helpers/time-converter').toNano(process.hrtime(currentNano));
	},
};
