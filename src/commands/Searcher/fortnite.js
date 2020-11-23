// Dependencies
const Fortnite = require('fortnite');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Get platform and username
	const stats = new Fortnite(bot.config.api_keys.fortnite);

	// Check if platform and user was entered
	if (!['kbm', 'gamepad', 'touch'].includes(args[0])) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('fortnite').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	if (!args[1]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('fortnite').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// Get platform and user
	const platform = args.shift();
	const username = args.join(' ');
	const r = await message.channel.send(`Retrieving Fortnite information on **${username}**.`);

	// Retrieve stats from database
	stats.user(username, platform).then(data => {
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
		// If data wasn't found
		if (message.deletable) message.delete();
		r.delete();
		message.error(settings.Language, 'SEARCHER/UNKNOWN_USER').then(m => m.delete({ timeout: 10000 }));
		if (bot.config.debug) bot.logger.error(`${err.message} - command: fortnite.`);
	});
};

module.exports.config = {
	command: 'fortnite',
	aliases: ['fort', 'fortnight'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'fortnite',
	category: 'Searcher',
	description: 'Get information on a Fortnite account.',
	usage: '${PREFIX}fortnite <kbm | gamepad | touch> <user>',
};
