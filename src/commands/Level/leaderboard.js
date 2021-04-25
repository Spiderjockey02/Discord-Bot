// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ RankSchema } = require('../../database/models'),
	paginate = require('../../utils/pagenator'),
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
	async run(bot, message, settings) {
		// Retrieve Ranks from database
		RankSchema.find({
			guildID: message.guild.id,
		}).sort([
			['Xp', 'descending'],
		]).exec(async (err, res) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}

			const embed = new MessageEmbed()
				.setTitle(bot.translate(settings.Language, 'LEVEL/LEADERBOARD_TITLE'))
				.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`);
			if (!res[0]) {
				// If there no results
				embed.addField(bot.translate(settings.Language, 'LEVEL/LEADERBOARD_FIELDT'), bot.translate(settings.Language, 'LEVEL/LEADERBOARD_FIELDDESC'));
				message.channel.send(embed);
			} else {
				// Get number of pages to generate
				let pagesNum = Math.ceil(res.length / 10);
				if (pagesNum === 0) pagesNum = 1;

				// generate pages
				const pages = [];
				for (let i = 0; i < pagesNum; i++) {
					const embed2 = new MessageEmbed()
						.setTitle(bot.translate(settings.Language, 'LEVEL/LEADERBOARD_TITLE'))
						.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`);
					for (let j = 0; j < 10; j++) {
						if (res[(i * 10) + j]) {
							const name = await message.guild.members.cache.get(res[(i * 10) + j].userID) || 'User left';
							if (name == 'User left') {
								embed2.addField(`${ordinal((i * 10) + j + 1)}. ${name}`, `**XP:** ${res[(i * 10) + j].Xp} | **Level:** ${res[(i * 10) + j].Level}`);
							} else {
								embed2.addField(`${ordinal((i * 10) + j + 1)}. ${name.user.username}`, `**XP:** ${res[(i * 10) + j].Xp} | **Level:** ${res[(i * 10) + j].Level}`);
							}
						}
					}
					// interact with paginator
					pages.push(embed2);
					if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, message, pages);
					else if(pagesNum == 1) message.channel.send(embed2);
				}
			}
		});
	}
};
