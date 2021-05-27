// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Fortnite extends Command {
	constructor(bot) {
		super(bot, {
			name: 'fortnite',
			dirname: __dirname,
			aliases: ['fort', 'fortnight'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a Fortnite account.',
			usage: 'fortnite <kbm / gamepad / touch> <user>',
			cooldown: 3000,
			examples: ['fortnite kbm ninja'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if platform and user was entered
		if (!['kbm', 'gamepad', 'touch'].includes(message.args[0])) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/fortnite:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/fortnite:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Get platform and user
		const platform = message.args.shift(),
			username = message.args.join(' ');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Fetch fornite account information
		await bot.Fortnite.user(username, platform).then(async data => {
			const embed = new Embed(bot, message.guild)
				.setColor(0xffffff)
				.setTitle('searcher/fortnite:TITLE', { USER: data.username })
				.setURL(data.url)
				.setDescription(message.translate('searcher/fortnite:DESC', { TOP_3: data.stats.lifetime.top_3.toLocaleString(settings.Language), TOP_5: data.stats.lifetime.top_5.toLocaleString(settings.Language), TOP_6: data.stats.lifetime.top_6.toLocaleString(settings.Language), TOP_12: data.stats.lifetime.top_12.toLocaleString(settings.Language), TOP_25: data.stats.lifetime.top_25.toLocaleString(settings.Language) }))
				.setThumbnail('https://vignette.wikia.nocookie.net/fortnite/images/d/d8/Icon_Founders_Badge.png')
				.addField(message.translate('searcher/fortnite:TOTAL'), (data.stats.solo.score + data.stats.duo.score + data.stats.squad.score).toLocaleString(settings.Language), true)
				.addField(message.translate('searcher/fortnite:PLAYED'), data.stats.lifetime.matches.toLocaleString(settings.Language), true)
				.addField(message.translate('searcher/fortnite:WINS'), data.stats.lifetime.wins.toLocaleString(settings.Language), true)
				.addField(message.translate('searcher/fortnite:WINS_PRE'), `${((data.stats.lifetime.wins / data.stats.lifetime.matches) * 100).toFixed(2)}%`, true)
				.addField(message.translate('searcher/fortnite:KILLS'), data.stats.lifetime.kills.toLocaleString(settings.Language), true)
				.addField(message.translate('searcher/fortnite:K/D'), data.stats.lifetime.kd, true);
			await message.channel.send(embed);
		}).catch(err => {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: 'fortnite' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		});
		msg.delete();
	}
};
