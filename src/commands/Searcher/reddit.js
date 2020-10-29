// Dependencies
const Discord = require('discord.js');
const { KSoftClient } = require('@ksoft/api');

module.exports.run = async (bot, message, args, emojis, settings) => {
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('reddit').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	try {
		let reddit;
		// Check if its a NSFW channel or not
		if (message.channel.nsfw) {
			// NSFW content can be shown
			reddit = await ksoft.images.reddit(args[0], { removeNSFW: false });
		} else {
			reddit = await ksoft.images.reddit(args[0], { removeNSFW: true });
		}
		// Send message to channel
		const embed = new Discord.MessageEmbed()
			.setTitle(`From /${reddit.post.subreddit}`)
			.setURL(reddit.post.link)
			.setImage(reddit.url)
			.setFooter(`👍 ${reddit.post.upvotes}   👎 ${reddit.post.downvotes} | Provided by KSOFT.API`);
		message.channel.send(embed);
	} catch (e) {
		message.delete();
		return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'reddit',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'reddit',
	category: 'Searcher',
	description: 'Send a random image from a chosen subreddit.',
	usage: '${PREFIX}reddit <subreddit>',
};
