// Dependencies
const { Embed } = require('../../utils'),
	{ paginate } = require('../../utils'),
	Command = require('../../structures/Command.js');

// Show the ordinal for the ranks
// eslint-disable-next-line no-sparse-arrays
const ordinal = (num) => `${num.toLocaleString('en-US')}${[, 'st', 'nd', 'rd'][(num / 10) % 10 ^ 1 && num % 10] || 'th'}`;

/**
 * Leaderboard command
 * @extends {Command}
*/
class Leaderboard extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
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

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

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

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
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

	/**
	 * Function for creating leaderboard paginator
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @returns {embed}
	*/
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
						const name = await guild.members.fetch(res[(i * 10) + j].userID).catch(() => null) || 'User left';
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
}

module.exports = Leaderboard;
