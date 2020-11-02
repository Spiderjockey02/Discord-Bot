// Dependencies
const { KSoftClient } = require('@ksoft/api');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	// Retrieve a random meme
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	const meme = await ksoft.images.meme();
	// An error has occured
	if (meme.url == undefined) {
		if (bot.config.debug) bot.logger.error('An error occured when running command: meme.');
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
		message.delete();
		return;
	}
	// Send the meme to channel
	const embed = new MessageEmbed()
		.setTitle(`From /${meme.post.subreddit}`)
		.setColor(16333359)
		.setURL(meme.post.link)
		.setImage(meme.url)
		.setFooter(`👍 ${meme.post.upvotes}   👎 ${meme.post.downvotes} | Provided by KSOFT.API`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'meme',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Meme',
	category: 'Fun',
	description: 'Sends a random meme.',
	usage: '${PREFIX}meme',
};
