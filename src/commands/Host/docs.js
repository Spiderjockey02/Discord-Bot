// Dependencies
const { get } = require('axios');

module.exports.run = async (bot, message, args) => {
	// Make sure only bot owner can do this command
	if (!bot.config.ownerID.includes(message.author.id)) return;

	// Get docs information
	const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args)}`;
	get(url).then((embed) => {

		// Display information (if no error)
		const { data } = embed;
		if (data && !data.error) {
			message.channel.send({ embed: data });
		} else {
			message.channel.send('Could not find that documentation.');
		}
	}).catch(err => console.log(err));
};

module.exports.config = {
	command: 'docs',
};

module.exports.help = {
	name: 'Docs',
	category: 'Host',
	description: 'Displays Discord.js documentation.',
	usage: '${PREFIX}docs <query>',
};
