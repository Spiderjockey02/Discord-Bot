// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Fortnite command
 * @extends {Command}
*/
class Fortnite extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'fortnite',
			dirname: __dirname,
			aliases: ['fort', 'fortnight'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a Fortnite account.',
			usage: 'fortnite <kbm / gamepad / touch> <user>',
			cooldown: 3000,
			examples: ['fortnite kbm ninja'],
			slash: true,
			options: [{
				name: 'device',
				description: 'Device type',
				type: 'STRING',
				required: true,
			},
			{
				name: 'username',
				description: 'username of fortnite account.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Check if platform and user was entered
		if (!['kbm', 'gamepad', 'touch'].includes(message.args[0])) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/fortnite:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/fortnite:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Get platform and user
		const platform = message.args.shift(),
			username = message.args.join(' ');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Fetch fornite account information
		try {
			const embed = await this.createEmbed(bot, message.guild, username, platform);
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			console.log(err);
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
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			username = args.get('username').value,
			platform = args.get('device').value;

		// send embed
		try {
			const embed = await this.createEmbed(bot, guild, username, platform);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for fetching/creating fornite embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} username The username to search
	 * @param {string} platform The platform to search the user on
 	 * @returns {embed}
	*/
	async createEmbed(bot, guild, username, platform) {
		const data = await (new (require('../../APIs/fortnite.js'))(bot.config.api_keys.fortnite)).user(username, platform);
		return new Embed(bot, guild)
			.setColor(0xffffff)
			.setTitle('searcher/fortnite:TITLE', { USER: data.username })
			.setURL(data.url)
			.setDescription(guild.translate('searcher/fortnite:DESC', { TOP_3: data.stats.lifetime.top_3.toLocaleString(guild.settings.Language), TOP_5: data.stats.lifetime.top_5.toLocaleString(guild.settings.Language), TOP_6: data.stats.lifetime.top_6.toLocaleString(guild.settings.Language), TOP_12: data.stats.lifetime.top_12.toLocaleString(guild.settings.Language), TOP_25: data.stats.lifetime.top_25.toLocaleString(guild.settings.Language) }))
			.setThumbnail('https://vignette.wikia.nocookie.net/fortnite/images/d/d8/Icon_Founders_Badge.png')
			.addField(guild.translate('searcher/fortnite:TOTAL'), (data.stats.solo.score + data.stats.duo.score + data.stats.squad.score).toLocaleString(guild.settings.Language), true)
			.addField(guild.translate('searcher/fortnite:PLAYED'), data.stats.lifetime.matches.toLocaleString(guild.settings.Language), true)
			.addField(guild.translate('searcher/fortnite:WINS'), data.stats.lifetime.wins.toLocaleString(guild.settings.Language), true)
			.addField(guild.translate('searcher/fortnite:WINS_PRE'), `${((data.stats.lifetime.wins / data.stats.lifetime.matches) * 100).toFixed(2)}%`, true)
			.addField(guild.translate('searcher/fortnite:KILLS'), `${data.stats.lifetime.kills.toLocaleString(guild.settings.Language)}`, true)
			.addField(guild.translate('searcher/fortnite:K/D'), `${data.stats.lifetime.kd}`, true);
	}
}

module.exports = Fortnite;
