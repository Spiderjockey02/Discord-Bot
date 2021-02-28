// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class G_start extends Command {
	constructor(bot) {
		super(bot, {
			name: 'g-start',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['gstart', 'g-create'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Start a giveaway',
			usage: 'g-start <time> <Number of winners> <prize>',
			cooldown: 30000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make sure the user has the right permissions to use giveaway
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure a time, winner count & prize is entered
		if (args.length <= 2) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// Get time
		const time = require('../../helpers/time-converter.js').getTotalTime(args[0], message, settings.Language);
		if (!time) return;

		// Make sure that number of winners is a number
		if (isNaN(args[1])) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'GIVEAWAY/INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));
		}

		// Make sure prize is less than 256 characters
		if (args.slice(2).join(' ').length >= 256) {
			if (message.deletable) message.delete();
			return message.channel.send('Prize must be less than 256 characters long.').then(m => m.delete({ timeout: 5000 }));
		}

		// Start the giveaway
		bot.giveawaysManager.start(message.channel, {
			time: time,
			prize: args.slice(2).join(' '),
			winnerCount: parseInt(args[1]),
			hostedBy: message.member,
			messages: message.translate(settings.Language, 'GIVEAWAY/GIVEAWAY_DATA'),
			// language settings
		}).then(() => {
			bot.logger.log(`${message.author.tag} started a giveaway in server: [${message.guild.id}].`);
		}).catch(err => {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		});
	}
};
