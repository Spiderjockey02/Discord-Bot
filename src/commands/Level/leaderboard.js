// Dependencies
const { Embed } = require('../../utils'),
	{ paginate } = require('../../utils'),
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
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		try {
			const res = await this.createLeaderboard(bot, message.guild);
			msg.delete();
			if (Array.isArray(res)) {
				paginate(bot, message.channel, res);
			} else if (typeof (res) == 'object') {
				message.channel.send({ embeds: [res] });
			} else {
				message.channel.send({ content: res });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);

		// Retrieve Ranks from database
		try {
			const res = await this.createLeaderboard(bot, guild);
			if (Array.isArray(res)) {
				paginate(bot, channel, res);
			} else if (typeof (res) == 'object') {
				interaction.reply({ embeds: [res] });
			} else {
				interaction.reply({ content: res });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	// create leaderboard
	async createLeaderboard(bot, guild) {
		const res = guild.levels.sort(({ Xp: a }, { Xp: b }) => b - a);

		// if an error occured
		const embed = new Embed(bot, guild)
			.setTitle('level/leaderboard:TITLE')
			.setURL(`${bot.config.websiteURL}/leaderboard/${guild.id}`);
		if (!res[0]) {
			// If there no results
			embed.addField(guild.translate('level/leaderboard:EMPTY_TITLE'), guild.translate('level/leaderboard:EMPTY_DESC'));
			return embed;
		} else {
			// Get number of pages to generate
			let pagesNum = Math.ceil(res.length / 10);
			if (pagesNum === 0) pagesNum = 1;

			// generate pages
			const pages = [];
			for (let i = 0; i < pagesNum; i++) {
				const embed2 = new Embed(bot, guild)
					.setTitle('level/leaderboard:TITLE')
					.setURL(`${bot.config.websiteURL}/leaderboard/${guild.id}`);
				for (let j = 0; j < 10; j++) {
					if (res[(i * 10) + j]) {
						// eslint-disable-next-line no-empty-function
						const name = await guild.members.fetch(res[(i * 10) + j].userID).catch(() => {}) || 'User left';
						if (name == 'User left') {
							embed2.addField(guild.translate('level/leaderboard:FIELD_TITLE', { POS: ordinal((i * 10) + j + 1), NAME: name }),
								guild.translate('level/leaderboard:FIELD_DATA', { XP: res[(i * 10) + j].Xp.toLocaleString(guild.settings.Language), LEVEL: res[(i * 10) + j].Level.toLocaleString(guild.settings.Language) }));
						} else {
							embed2.addField(guild.translate('level/leaderboard:FIELD_TITLE', { POS: ordinal((i * 10) + j + 1), NAME: name.user.username }),
								guild.translate('level/leaderboard:FIELD_DATA', { XP: res[(i * 10) + j].Xp.toLocaleString(guild.settings.Language), LEVEL: res[(i * 10) + j].Level.toLocaleString(guild.settings.Language) }));
						}
					}
				}
				// interact with paginator
				pages.push(embed2);
				if (i == pagesNum - 1 && pagesNum > 1) {
					return pages;
				} else if (pagesNum == 1) {return embed2;}
			}
		}
	}
};
