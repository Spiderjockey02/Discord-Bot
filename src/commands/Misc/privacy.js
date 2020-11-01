module.exports.run = async (bot, message) => {
	// Send link to privacy policy
	message.channel.send({ embed:{ description:'[Privacy Policy](https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md)' } });
};

module.exports.config = {
	command: 'privacy',
	aliases: ['priv'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Privacy',
	category: 'Misc',
	description: 'Sends a link to the privacy policy.',
	usage: '${PREFIX}privacy',
};
