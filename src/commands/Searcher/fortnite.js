// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		if (!['kbm', 'gamepad', 'touch'].includes(message.args[0])) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
		if (!message.args[1]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// Get platform and user
		const platform = message.args.shift(),
			username = message.args.join(' ');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name} account info...`);

		// Fetch fornite account information
		bot.Fortnite.user(username, platform).then(async data => {
			const embed = new MessageEmbed()
				.setColor(0xffffff)
				.setTitle(`Stats for ${data.username}`)
				.setURL(data.url)
				.setDescription(`**Top placements**\n\n**Top 3's:** *${data.stats.lifetime.top_3}*\n**Top 5's:** *${data.stats.lifetime.top_5}*\n**Top 6's:** *${data.stats.lifetime.top_6}*\n**Top 12's:** *${data.stats.lifetime.top_12}*\n**Top 25's:** *${data.stats.lifetime.top_25}*`)
				.setThumbnail('https://vignette.wikia.nocookie.net/fortnite/images/d/d8/Icon_Founders_Badge.png')
				.addField('Total Score:', data.stats.solo.score + data.stats.duo.score + data.stats.squad.score, true)
				.addField('Matches Played:', data.stats.lifetime.matches, true)
				.addField('Wins:', data.stats.lifetime.wins, true)
				.addField('Win percentage:', `${((data.stats.lifetime.wins / data.stats.lifetime.matches) * 100).toFixed(2)}%`, true)
				.addField('Kills:', data.stats.lifetime.kills, true)
				.addField('K/D Ratio:', data.stats.lifetime.kd, true);
			await message.channel.send(embed);
		}).catch(err => {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: 'fortnite' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		});
		msg.delete();
	}
};
