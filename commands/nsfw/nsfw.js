// Dependecies
const Discord = require('discord.js');
const { KSoftClient } = require('@ksoft/api');

module.exports.run = async (bot, message) => {
	if (bot.config.NSFWBot == false) return;
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	// Make sure this commands is being run in a NSFW channel
	if (message.channel.nsfw == false) {
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This command can only be done in a \`NSFW\` channel.` } }).then(m => m.delete({ timeout: 5000 }));
		return;
	}
	// Send image to channel
	const pic = await ksoft.images.nsfw();
	const embed = new Discord.MessageEmbed()
		.setTitle(`From /${pic.post.subreddit}`)
		.setURL(pic.post.link)
		.setImage(pic.url)
		.setFooter(`👍 ${pic.post.upvotes}   👎 ${pic.post.downvotes} | Provided by KSOFT.API`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'nsfw',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'NSFW',
	category: 'nsfw',
	description: 'See some cheeky photos',
	usage: '!nsfw',
};
