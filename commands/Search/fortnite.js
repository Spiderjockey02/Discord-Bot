// Will show help page
const Fortnite = require('fortnite');
const Discord = require('discord.js');
module.exports.run = async (bot, message, args) => {
	const stats = new Fortnite(bot.config.fortniteAPI);
	if (!['pc', 'xbl', 'psn'].includes(args[0])) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('fortnite').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	if (!args[1]) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('fortnite').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const platform = args.shift();
	const username = args.join(' ');
	const r = await message.channel.send(`Getting fortnite information on **${username}**.`);
	stats.user(username, platform).then(data => {
		const embed = new Discord.MessageEmbed()
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
		if (message.deletable) message.delete();
		r.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This username was unable to be found.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(err.message);
	});
};
module.exports.config = {
	command: 'fortnite',
	aliases: ['fort', 'fortnight'],
};
module.exports.help = {
	name: 'fortnite',
	category: 'Search',
	description: 'Get information on a fortnite account.',
	usage: '!fortnite [psn | pc | xbl] [user]',
};
