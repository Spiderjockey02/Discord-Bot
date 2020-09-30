// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	if (message.author.id != bot.config.ownerID) return;
	if (message.deletable) message.delete();
	const embed = new Discord.MessageEmbed()
		.setTitle('Verify')
		.setDescription('Click the reaction below to access this server.');
	message.channel.send(embed).then(async function(msg) {
		await msg.react('748984689779540110');
	});
	bot.updateGuild(message.guild, { AntiRaidChannelID : message.channel.id }, bot);
};

module.exports.config = {
	command: 'verify',
};

module.exports.help = {
	name: 'Verify',
	category: 'Guild',
	description: 'Allows access to the server.',
	usage: '!verify',
};
