// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

// access token to interact with twitch API
let access_token = null;

/**
 * Twitch command
 * @extends {Command}
*/
class Twitch extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'twitch',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a twitch account.',
			usage: 'twitch <user>',
			cooldown: 3000,
			examples: ['twitch ninja'],
			slash: true,
			options: [{
				name: 'username',
				description: 'Account name',
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
		// Get information on twitch accounts
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/twitch:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		const user = message.args[0];

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// fetch data
		try {
			const twitchUser = await this.getUserByUsername(bot, user);
			if (twitchUser) {
				const stream = await this.getStreamByUsername(bot, user);
				const embed = new Embed(bot, message.guild)
					.setTitle(twitchUser.display_name)
					.setURL(`https://twitch.tv/${twitchUser.login}`)
					.setThumbnail(twitchUser.profile_image_url)
					.setAuthor({ name: 'Twitch', iconURL: 'https://i.imgur.com/4b9X738.png' })
					.addField(message.translate('searcher/twitch:BIO'), twitchUser.description || message.translate('searcher/twitch:NO_BIO'), true)
					.addField(message.translate('searcher/twitch:TOTAL'), twitchUser.view_count.toLocaleString(settings.Language), true)
					.addField(message.translate('searcher/twitch:FOLLOWERS'), await this.getFollowersFromId(bot, twitchUser.id).then(num => num.toLocaleString(settings.Language)), true);
				if (stream) {
					embed
						.addField('\u200B', message.translate('searcher/twitch:STREAMING', { TITLE: stream.title, NUM: stream.viewer_count }))
						.setImage(stream.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080));
				}
				message.channel.send({ embeds: [embed] });
			} else {
				message.channel.error('searcher/twitch:NOT_FOUND');
			}
			msg.delete();
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
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
			user = args.get('username').value;

		try {
			const twitchUser = await this.getUserByUsername(bot, user);
			if (twitchUser) {
				const stream = await this.getStreamByUsername(bot, user);
				const embed = new Embed(bot, guild)
					.setTitle(twitchUser.display_name)
					.setURL(`https://twitch.tv/${twitchUser.login}`)
					.setThumbnail(twitchUser.profile_image_url)
					.setAuthor({ name: 'Twitch', iconURL: 'https://i.imgur.com/4b9X738.png' })
					.addField(guild.translate('searcher/twitch:BIO'), twitchUser.description || guild.translate('searcher/twitch:NO_BIO'), true)
					.addField(guild.translate('searcher/twitch:TOTAL'), twitchUser.view_count.toLocaleString(guild.settings.Language), true)
					.addField(guild.translate('searcher/twitch:FOLLOWERS'), await this.getFollowersFromId(bot, twitchUser.id).then(num => num.toLocaleString(guild.settings.Language)), true);
				if (stream) {
					embed
						.addField('\u200B', guild.translate('searcher/twitch:STREAMING', { TITLE: stream.title, NUM: stream.viewer_count }))
						.setImage(stream.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080));
				}
				interaction.reply({ embeds: [embed] });
			} else {
				interaction.reply({ embeds: [channel.error('searcher/twitch:NOT_FOUND', {}, true)] });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}

	/**
	 * Function for fetching basic information on user
	 * @param {bot} bot The instantiating client
	 * @param {interaction} login The username to search
	 * @returns {object}
	*/
	async getUserByUsername(bot, login) {
		return this.request(bot, '/users', { login }).then(u => u && u.data[0]);
	}

	/**
	 * Function for checking if user is streaming
	 * @param {bot} bot The instantiating client
	 * @param {interaction} username The username to search
	 * @returns {object}
	*/
	async getStreamByUsername(bot, username) {
		return this.request(bot, '/streams', { user_login: username }).then(s => s && s.data[0]);
	}

	/**
	 * Function for fetching data from twitch API
	 * @param {bot} bot The instantiating client
	 * @param {string} endpoint the endpoint of the twitch API to request
	 * @param {object} queryParams The query sent to twitch API
	 * @returns {object}
	*/
	request(bot, endpoint, queryParams = {}) {
		const qParams = new URLSearchParams(queryParams);
		return fetch('https://api.twitch.tv/helix' + endpoint + `?${qParams.toString()}`, {
			headers: { 'Client-ID': bot.config.api_keys.twitch.clientID, 'Authorization': `Bearer ${access_token}` },
		}).then(res => res.json())
			.then(data => {
				if (data.error === 'Unauthorized') {
					return this.refreshTokens(bot)
						.then(() => this.request(bot, endpoint, queryParams));
				}
				return data;
			}).catch(e => console.log(e));
	}

	/**
	 * Function for fetching follower data from user
	 * @param {bot} bot The instantiating client
	 * @param {string} id the ID of the user
	 * @returns {object}
	*/
	async getFollowersFromId(bot, id) {
		return this.request(bot, '/users/follows', { to_id: id }).then(u => u && u.total);
	}

	/**
	 * Function for fetching access_token to interact with the twitch API
	 * @param {bot} bot The instantiating client
	 * @returns {string}
	*/
	async refreshTokens(bot) {
		await fetch(`https://id.twitch.tv/oauth2/token?client_id=${bot.config.api_keys.twitch.clientID}&client_secret=${bot.config.api_keys.twitch.clientSecret}&grant_type=client_credentials`, {
			method: 'POST',
		}).then(res => res.json()).then(data => {
			access_token = data.access_token;
		}).catch(e => console.log(e));
	}
}

module.exports = Twitch;
