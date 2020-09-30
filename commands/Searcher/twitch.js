// const fetch = require('node-fetch');
const Discord = require('discord.js');
module.exports.run = async (bot, message, args) => {
	// Get information on twitch accounts
	if (message.author.id != bot.config.ownerID) return;
	if (!args[0]) return message.channel.send('Please enter a Twitch username');
	const embed = new Discord.MessageEmbed()
		.setColor(10181046)
		.setTitle(`${args[0]}`)
		.setURL(`https://www.twitch.tv/${args[0]}`);
	message.channel.send(embed);
	// const res = await fetch(`https://api.twitch.tv/helix/users?login=${args[0]}`, {
	// method: 'GET',
	// Authorization: `${bot.config.TwitchAPI}`,
	// }).then(res => res.json());
	// console.log(res);
};

module.exports.config = {
	command: 'twitch',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Twitch',
	category: 'Searcher',
	description: 'Gets information on a twitch account',
	usage: '!twitch [user]',
};
