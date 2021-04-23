// Dependencies
const { PremiumSchema, timeEventSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Premium extends Command {
	constructor(bot) {
		super(bot, {
			name: 'premium',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add or remove user\'s premium',
			usage: 'premium <add | remove> <user | guild> <ID> [time]',
			cooldown: 3000,
			examples: ['premium add 184376969016639488'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		if (message.deletable) message.delete();

		// Make sure args was entered
		if (!message.args[2]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Validate ID
		let id;
		if (message.args[1] == 'user') {
			id = await bot.getUser(message.args[2])?.then(u => u.id);
			if (!id) return message.channel.send('Incorrect ID');
		} else if (message.args[1] == 'guild') {
			id = await bot.guilds.fetch(message.args[2])?.then(g => g.id);
			if (!id) return message.channel.send('Incorrect ID');
		} else {
			return message.channel.send('Incorrect options');
		}

		// interact with DB
		PremiumSchema.findOne({
			ID: id,
			Type: message.args[1],
		}, async (err, res) => {
			// if an error occurred
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}

			if (!res && message.args[0] == 'add') {
				// check if premium is only for a certain amount of time
				const possibleTime = message.args[message.args.length - 1];
				let timeAdded;
				if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
					const time = bot.timeFormatter.getTotalTime(possibleTime, message, settings.Language);
					if (!time) return;

					// connect to database
					const newEvent = await new timeEventSchema({
						userID: message.args[1] == 'user' ? id : 0,
						guildID: message.args[1] == 'guild' ? id : 0,
						time: new Date(new Date().getTime() + time),
						channelID: message.channel.id,
						type: 'premium',
					});
					await newEvent.save();

					// unban user
					setTimeout(async () => {
						await PremiumSchema.findByIdAndRemove(newPremium._id, (err) => {
							if (err) console.log(err);
						});

						// Delete item from database as bot didn't crash
						await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
							if (err) console.log(err);
						});
					}, time);
					timeAdded = Date.now() + time;
				} else {
					timeAdded = 0;
				}

				const newPremium = new PremiumSchema({
					ID: id,
					Type: message.args[1],
					premiumSince: Date.now(),
					premiumTill: timeAdded,
				});

				// save user to DB
				try {
					await newPremium.save();
					message.args[1] == 'user' ? await bot.getUser(message.args[2]).then(user => user.premium = true) : bot.guilds.cache.get(message.args[2]).premium = true;
					message.channel.send({ embed:{ color:3066993, description:`<:checkmark:762697412316889150> ${message.args[1]}: ${id} has been given premium.` } }).then(m => m.delete({ timeout: 30000 }));
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
				}
			} else if (res && message.args[0] == 'add') {
				// Type already has premium
				message.channel.send(`${message.args[1]}: ${id} already has premium.`).then(m => m.delete({ timeout: 30000 }));
			} else if (!res && message.args[0] == 'remove') {
				// Type already doesn't have premium
				message.channel.send(`${message.args[1]}: ${id} already doesn't have premium.`).then(m => m.delete({ timeout: 30000 }));
			} else if (res && message.args[0] == 'remove') {

				// Try and remove the premium 'Type'
				try {
					await PremiumSchema.collection.deleteOne({ ID: id, Type: message.args[1] });
					message.args[1] == 'user' ? await bot.getUser(message.args[2]).then(user => user.premium = false) : bot.guilds.cache.get(message.args[2]).premium = false;
					// send success message
					message.channel.send({ embed:{ color:15158332, description:`<:cross:762698700069011476> ${message.args[1]}: ${id} has lost premium` } }).then(m => m.delete({ timeout: 30000 }));
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
				}
			} else {
				return message.channel.send('Not an option');
			}
		});
	}
};
