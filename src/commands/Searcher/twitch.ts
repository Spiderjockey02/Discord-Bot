// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Twitch command
 * @extends {Command}
*/
export default class Twitch extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'twitch',
			dirname: __dirname,
			description: 'Get information on a twitch account.',
			usage: 'twitch <user>',
			cooldown: 3000,
			examples: ['twitch ninja'],
			slash: true,
			options: [{
				name: 'username',
				description: 'Account name',
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
		// Get information on twitch accounts
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/twitch:USAGE')) });
		const user = message.args[0];

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// fetch data
		try {
			const embed = await this.fetchTwitchData(client, message.channel, user);
			msg.delete();
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			user = args.get('username').value;

		try {
			const embed = await this.fetchTwitchData(client, channel, user);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}

	async fetchTwitchData(client, channel, username) {
		const twitch = await client.fetch('socials/twitch', { username: username });
		if (twitch.error) return channel.error('misc:ERROR_MESSAGE', { ERROR: twitch.error }, true);

		const embed = new Embed(client, channel.guild)
			.setTitle(twitch.display_name)
			.setURL(`https://twitch.tv/${twitch.login}`)
			.setThumbnail(twitch.profile_image_url)
			.setAuthor({ name: 'Twitch', iconURL: 'https://i.imgur.com/4b9X738.png' })
			.addFields(
				{ name: channel.guild.translate('searcher/twitch:BIO'), value: twitch.description || channel.guild.translate('searcher/twitch:NO_BIO'), inline: true },
				{ name: channel.guild.translate('searcher/twitch:TOTAL'), value: twitch.view_count.toLocaleString(channel.guild.settings.Language), inline: true },
				{ name: channel.guild.translate('searcher/twitch:FOLLOWERS'), value: twitch.followers.toLocaleString(channel.guild.settings.Language), inline: true },
			);

		if (twitch.steaming) {
			embed
				.addFields({ name: '\u200B', value: channel.guild.translate('searcher/twitch:STREAMING', { TITLE: twitch.steaming.title, NUM: twitch.steaming.viewer_count }) })
				.setImage(twitch.steaming.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080));
		}
		return embed;
	}
}

