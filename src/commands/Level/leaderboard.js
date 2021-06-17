// Dependencies
const { Embed } = require('../../utils'),
	{ RankSchema } = require('../../database/models'),
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
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

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
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			const embed = new Embed(bot, message.guild)
				.setTitle('level/leaderboard:TITLE')
				.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`);
			if (!res[0]) {
				// If there no results
				embed.addField(message.translate('level/leaderboard:EMPTY_TITLE'), message.translate('level/leaderboard:EMPTY_DESC'));
				msg.delete();
				message.channel.send(embed);
			} else {
				// Get number of pages to generate
				let pagesNum = Math.ceil(res.length / 10);
				if (pagesNum === 0) pagesNum = 1;

				// generate pages
				const pages = [];
				for (let i = 0; i < pagesNum; i++) {
					const embed2 = new Embed(bot, message.guild)
						.setTitle('level/leaderboard:TITLE')
						.setURL(`${bot.config.websiteURL}/leaderboard/${message.guild.id}`);
					for (let j = 0; j < 10; j++) {
						if (res[(i * 10) + j]) {
							// eslint-disable-next-line no-empty-function
							const name = await message.guild.members.fetch(res[(i * 10) + j].userID).catch(() => {}) || 'User left';
							if (name == 'User left') {
								embed2.addField(message.translate('level/leaderboard:FIELD_TITLE', { POS: ordinal((i * 10) + j + 1), NAME: name }),
									message.translate('level/leaderboard:FIELD_DATA', { XP: res[(i * 10) + j].Xp.toLocaleString(settings.Language), LEVEL: res[(i * 10) + j].Level.toLocaleString(settings.Language) }));
							} else {
								embed2.addField(message.translate('level/leaderboard:FIELD_TITLE', { POS: ordinal((i * 10) + j + 1), NAME: name.user.username }),
									message.translate('level/leaderboard:FIELD_DATA', { XP: res[(i * 10) + j].Xp.toLocaleString(settings.Language), LEVEL: res[(i * 10) + j].Level.toLocaleString(settings.Language) }));
							}
						}
					}
					// interact with paginator
					pages.push(embed2);
					if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, message.channel, pages);
					else if(pagesNum == 1) message.channel.send(embed2);
				}
				msg.delete();
			}
		});
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channel.cache.get(interaction.channelID);
		// Retrieve Ranks from database
		RankSchema.find({
			guildID: guild.id,
		}).sort([
			['Xp', 'descending'],
		]).exec(async (err, res) => {
			// if an error occured
			if (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
			}

			const embed = new Embed(bot, guild)
				.setTitle('level/leaderboard:TITLE')
				.setURL(`${bot.config.websiteURL}/leaderboard/${guild.id}`);
			if (!res[0]) {
				// If there no results
				embed.addField(bot.translate('level/leaderboard:EMPTY_TITLE'), bot.translate('level/leaderboard:EMPTY_DESC'));
				bot.send(interaction, embed);
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
								embed2.addField(bot.translate('level/leaderboard:FIELD_TITLE', { POS: ordinal((i * 10) + j + 1), NAME: name }),
									bot.translate('level/leaderboard:FIELD_DATA', { XP: res[(i * 10) + j].Xp.toLocaleString(guild.settings.Language), LEVEL: res[(i * 10) + j].Level.toLocaleString(guild.settings.Language) }));
							} else {
								embed2.addField(bot.translate('level/leaderboard:FIELD_TITLE', { POS: ordinal((i * 10) + j + 1), NAME: name.user.username }),
									bot.translate('level/leaderboard:FIELD_DATA', { XP: res[(i * 10) + j].Xp.toLocaleString(guild.settings.Language), LEVEL: res[(i * 10) + j].Level.toLocaleString(guild.settings.Language) }));
							}
						}
					}
					// interact with paginator
					pages.push(embed2);
					if (i == pagesNum - 1 && pagesNum > 1) {
						paginate(bot, channel, pages);
						return await bot.send(interaction, 'Loaded Leaderboard');
					} else if(pagesNum == 1) {bot.send(interaction, embed2);}
				}
			}
		});
	}
};
