// Dependencies
const { Premium: premiumDB } = require('../../modules/database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Premium extends Command {
	constructor(bot) {
		super(bot, {
			name: 'premium',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add or remove user\'s premium',
			usage: 'premium <add | remove> userID',
			cooldown: 3000,
			examples: ['premium add 184376969016639488'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		if (message.deletable) message.delete();

		// Make sure args was entered
		if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Get user
		const user = await bot.getUser(args[1]);
		if (!user) return message.channel.send('No user found with that ID');

		// get choice
		const choice = args[0].toLowerCase() == 'add' ? true : false;

		// interact with DB
		premiumDB.findOne({
			userID: user.id,
		}, async (err, res) => {
			if (err) bot.logger.error(err.message);

			// new user gettting premium
			if (!res && choice) {
				const newPremium = new premiumDB({
					userID: user.id,
					premium: choice,
					premiumSince: Date.now(),
				});
				try {
					await newPremium.save();
					user.premium = true;
					message.channel.send({ embed:{ color:3066993, description:`<:checkmark:762697412316889150> ${user.tag} has been given premium.` } }).then(m => m.delete({ timeout: 30000 }));
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
				}
			} else if (!res) {
				message.channel.send('That user already doesn\'t have premium');
			} else if (res && choice) {
				message.channel.send('That user already has premium');
			} else {
				try {
					await premiumDB.collection.deleteOne({ userID: user.id });
					message.channel.send({ embed:{ color:15158332, description:`<:cross:762698700069011476> ${user.tag} has lost premium` } }).then(m => m.delete({ timeout: 30000 }));
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
				}

			}
		});
	}
};
