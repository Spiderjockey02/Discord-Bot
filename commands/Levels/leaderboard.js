// Dependencies
const Discord = require('discord.js');
const Ranks = require('../../modules/database/models/levels');

module.exports.run = async (bot, message, args, emoji, settings) => {
	if (settings.LevelPlugin == false) return;
	// Retrieve Ranks from database
	Ranks.find({
		guildID: message.guild.id,
	}).sort([
		['Xp', 'descending'],
	]).exec((err, res) => {
		if (err) console.log(err);
		const embed = new Discord.MessageEmbed()
			.setTitle('Leaderboard');
		if (res.length === 0) {
			// If there no results
			embed.setColor();
			embed.addField('No data found', 'Please type in chat to gain experience.');
		} else if (res.length < 10) {
			// If there are less than 10 results and then show this
			for (let i = 0; i < res.length; i++) {
				const name = message.guild.members.cache.get(res[i].userID) || 'User left';
				if (name == 'User left') {
					embed.addField(`${i + 1}. ${name}`, `**XP:** ${res[i].Xp}`);
				} else {
					embed.addField(`${i + 1}. ${name.user.username}`, `**XP:** ${res[i].Xp}`);
				}
			}
		} else {
			// more than 10 results
			for (let i = 0; i < 10; i++) {
				const name = message.guild.members.get(res[i].userID) || 'User left';
				if (name == 'User left') {
					embed.addField(`${i + 1}. ${name}`, `**XP:** ${res[i].Xp}`);
				} else {
					embed.addField(`${i + 1}. ${name.user.username}`, `**XP:** ${res[i].Xp}`);
				}
			}
		}
		message.channel.send(embed);
	});
};

module.exports.config = {
	command: 'leaderboard',
	aliases: ['lb', 'levels', 'ranks'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Leaderboard',
	category: 'Levels',
	description: 'Displays the Level leaderboard',
	usage: '${PREFIX}leaderboard',
};
