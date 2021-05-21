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
			examples: ['g-start 1m 1 nitro', 'g-start 2h30m 3 nitro classic'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// delete command
		if (message.deletable) message.delete();

		// Make sure the user has the right permissions to use giveaway
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Check if bot has permission to add reactions
		if (!message.channel.permissionsFor(bot.user).has('ADD_REACTIONS')) {
			bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure a time, winner count & prize is entered
		if (message.args.length <= 2) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// Get time
		const time = bot.timeFormatter.getTotalTime(message.args[0], message, settings.Language);
		if (!time) return;

		// Make sure that number of winners is a number
		if (isNaN(message.args[1]) || message.args[1] > 10) return message.channel.error(settings.Language, 'GIVEAWAY/INCORRECT_WINNER_COUNT').then(m => setTimeout(() => { m.delete(); }, 5000));

		// Make sure prize is less than 256 characters
		if (message.args.slice(2).join(' ').length >= 256) return message.channel.send('Prize must be less than 256 characters long.').then(m => setTimeout(() => { m.delete(); }, 5000));

		// Start the giveaway
		bot.giveawaysManager.start(message.channel, {
			time: time,
			prize: message.args.slice(2).join(' '),
			winnerCount: parseInt(message.args[1]),
			hostedBy: message.member,
			messages: bot.translate(settings.Language, 'GIVEAWAY/GIVEAWAY_DATA'),
			// language settings
		}).then(() => {
			bot.logger.log(`${message.author.tag} started a giveaway in server: [${message.guild.id}].`);
		}).catch(err => {
			bot.logger.error(`Command: 'g-start' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		});
	}
};
