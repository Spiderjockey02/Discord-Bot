// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ Ranks } = require('../../modules/database/models/index'),
	Command = require('../../structures/Command.js');

// Show the ordinal for the ranks
// eslint-disable-next-line no-sparse-arrays
const ordinal = (num) => `${num.toLocaleString('en-US')}${[, 'st', 'nd', 'rd'][(num / 10) % 10 ^ 1 && num % 10] || 'th'}`;

module.exports = class Leaderboard extends Command {
	constructor(bot) {
		super(bot, {
			name: 'leaderboard',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lb', 'levels', 'ranks'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays the Servers\'s level leaderboard.',
			usage: 'leaderboard',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Retrieve Ranks from database
		Ranks.find({
			guildID: message.guild.id,
		}).sort([
			['Xp', 'descending'],
		]).exec((err, res) => {
			if (err) console.log(err);
			const embed = new MessageEmbed()
				.setTitle(message.translate(settings.Language, 'LEVEL/LEADERBOARD_TITLE'))
				.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`);
			if (res.length === 0) {
				// If there no results
				embed.addField(message.translate(settings.Language, 'LEVEL/LEADERBOARD_FIELDT'), message.translate(settings.Language, 'LEVEL/LEADERBOARD_FIELDDESC'));
			} else if (res.length < 10) {
				// If there are less than 10 results and then show this
				for (let i = 0; i < res.length; i++) {
					const name = message.guild.members.cache.get(res[i].userID) || 'User left';
					if (name == 'User left') {
						embed.addField(`${ordinal(i + 1)}. ${name}`, `**XP:** ${res[i].Xp}`);
					} else {
						embed.addField(`${ordinal(i + 1)}. ${name.user.username}`, `**XP:** ${res[i].Xp} | **Level:** ${res[i].Level}`);
					}
				}
			} else {
				// more than 10 results
				for (let i = 0; i < 10; i++) {
					const name = message.guild.members.cache.get(res[i].userID) || 'User left';
					if (name == 'User left') {
						embed.addField(`${ordinal(i + 1)}. ${name}`, `**XP:** ${res[i].Xp}`);
					} else {
						embed.addField(`${ordinal(i + 1)}. ${name.user.username}`, `**XP:** ${res[i].Xp}`);
					}
				}
			}
			message.channel.send(embed);
		});
	}
};
