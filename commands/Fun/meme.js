// Dependencies
const { KSoftClient } = require('@ksoft/api');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Retrieve a random meme
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	const meme = await ksoft.images.meme();
	// Send the meme to channel
	const embed = new Discord.MessageEmbed()
		.setTitle(`From /${meme.post.subreddit}`)
		.setURL(meme.post.link)
		.setImage(meme.url)
		.setFooter(`👍 ${meme.post.upvotes}   👎 ${meme.post.downvotes} | Provided by KSOFT.API`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'meme',
	aliases: ['meme'],
};

module.exports.help = {
	name: 'Meme',
	category: 'Fun',
	description: 'Sends a meme',
	usage: '!meme',
};
