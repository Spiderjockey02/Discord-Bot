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
			usage: 'fortnite <kbm | gamepad | touch> <user>',
			cooldown: 3000,
			examples: ['fortnite kbm ninja'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check if platform and user was entered
		if (!['kbm', 'gamepad', 'touch'].includes(args[0])) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Get platform and user
		const platform = args.shift();
		const username = args.join(' ');
		const r = await message.channel.send(`Retrieving Fortnite information on **${username}**.`);

		bot.Fortnite.user(username, platform).then(data => {
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
			r.delete();
			message.channel.send(embed);
		}).catch(err => {
			r.delete();
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		});
	}
};
