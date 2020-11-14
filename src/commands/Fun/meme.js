// Dependencies
const { KSoftClient } = require('@ksoft/api');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Retrieve a random meme
	const ksoft = new KSoftClient(bot.config.api_keys.ksoft);
	const meme = await ksoft.images.meme();

	// An error has occured
	if (meme.url == undefined) {
		if (bot.config.debug) bot.logger.error('An error occured when running command: meme.');
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		if (message.deletable) message.delete();
		return;
	}

	// Send the meme to channel
	const embed = new MessageEmbed()
		.setTitle(`${message.translate(settings.Language, 'FUN/MEME_TITLE')} /${meme.post.subreddit}`)
		.setColor(16333359)
		.setURL(meme.post.link)
		.setImage(meme.url)
		.setFooter(`👍 ${meme.post.upvotes}   👎 ${meme.post.downvotes} | ${message.translate(settings.Language, 'FUN/MEME_FOOTER')} KSOFT.API`);
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
