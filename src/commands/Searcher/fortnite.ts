// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Fortnite command
 * @extends {Command}
*/
export default class Fortnite extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {Commandfortnite} data The data for the command
	*/
	constructor() {
		super({
			name: 'fortnite',
			dirname: __dirname,
			aliases: ['fort', 'fortnight'],
			description: 'Get information on a Fortnite account.',
			usage: 'fortnite <kbm / gamepad / touch> <user>',
			cooldown: 3000,
			examples: ['fortnite kbm ninja'],
			slash: true,
			options: [{
				name: 'device',
				description: 'Device type',
				type: ApplicationCommandOptionType.String,
				choices: [...['kbm', 'gamepad', 'touch'].map(i => ({ name: i, value: i }))],
				required: true,
			},
			{
				name: 'username',
				description: 'username of fortnite account.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		// Check if platform and user was entered
		if (!['kbm', 'gamepad', 'touch'].includes(message.args[0])) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/fortnite:USAGE')) });
		if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/fortnite:USAGE')) });

		// Get platform and user
		const platform = message.args.shift(),
			username = message.args.join(' ');

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Fetch fornite account information
		try {
			const embed = await this.createEmbed(client, message.guild, message.channel, username, platform);
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @param {TextChannel} channel The channel the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			username = args.get('username').value,
			platform = args.get('device').value;

		// send embed
		try {
			const embed = await this.createEmbed(client, guild, channel, username, platform);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for fetching/creating fornite embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {channel} channel The channel the command was ran in
	 * @param {string} username The username to search
	 * @param {string} platform The platform to search the user on
 	 * @returns {embed}
	*/
	async createEmbed(client, guild, channel, username, platform) {
		const fortnite = await client.fetch('games/fortnite', { username, platform });
		if (fortnite.error) return channel.error('misc:ERROR_MESSAGE', { ERROR: fortnite.error }, true);

		// Check for error
		return new Embed(client, guild)
			.setColor(0xffffff)
			.setTitle('searcher/fortnite:TITLE', { USER: fortnite.username })
			.setURL(fortnite.url)
			.setDescription(guild.translate('searcher/fortnite:DESC', { TOP_3: fortnite.stats.lifetime.top_3.toLocaleString(guild.settings.Language), TOP_5: fortnite.stats.lifetime.top_5.toLocaleString(guild.settings.Language), TOP_6: fortnite.stats.lifetime.top_6.toLocaleString(guild.settings.Language), TOP_12: fortnite.stats.lifetime.top_12.toLocaleString(guild.settings.Language), TOP_25: fortnite.stats.lifetime.top_25.toLocaleString(guild.settings.Language) }))
			.setThumbnail('https://vignette.wikia.nocookie.net/fortnite/images/d/d8/Icon_Founders_Badge.png')
			.addFields(
				{ name: guild.translate('searcher/fortnite:TOTAL'), value: (fortnite.stats.solo.score + fortnite.stats.duo.score + fortnite.stats.squad.score).toLocaleString(guild.settings.Language), inline: true },
				{ name: guild.translate('searcher/fortnite:PLAYED'), value: fortnite.stats.lifetime.matches.toLocaleString(guild.settings.Language), inline: true },
				{ name: guild.translate('searcher/fortnite:WINS'), value: fortnite.stats.lifetime.wins.toLocaleString(guild.settings.Language), inline: true },
				{ name: guild.translate('searcher/fortnite:WINS_PRE'), value: `${((fortnite.stats.lifetime.wins / fortnite.stats.lifetime.matches) * 100).toFixed(2)}%`, inline: true },
				{ name: guild.translate('searcher/fortnite:KILLS'), value: `${fortnite.stats.lifetime.kills.toLocaleString(guild.settings.Language)}`, inline: true },
				{ name: guild.translate('searcher/fortnite:K/D'), value: `${fortnite.stats.lifetime.kd}`, inline: true },
			);

	}
}

