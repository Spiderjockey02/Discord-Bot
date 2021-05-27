// Dependecies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

// access token to interact with twitch API
let access_token = null;

module.exports = class Twitch extends Command {
	constructor(bot) {
		super(bot, {
			name: 'twitch',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a twitch account.',
			usage: 'twitch <user>',
			cooldown: 3000,
			examples: ['twitch ninja'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get information on twitch accounts
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/twitch:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		const user = message.args[0];

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// fetch data
		try {
			const twitchUser = await getUserByUsername(user);
			if (twitchUser) {
				const stream = await getStreamByUsername(user);
				const embed = new Embed(bot, message.guild)
					.setTitle(twitchUser.display_name)
					.setURL(`https://twitch.tv/${twitchUser.login}`)
					.setThumbnail(twitchUser.profile_image_url)
					.setAuthor('Twitch', 'https://i.imgur.com/4b9X738.png')
					.addField(message.translate('searcher/twitch:BIO'), twitchUser.description || message.translate('searcher/twitch:NO_BIO'), true)
					.addField(message.translate('searcher/twitch:TOTAL'), twitchUser.view_count.toLocaleString(settings.Language), true)
					.addField(message.translate('searcher/twitch:FOLLOWERS'), await getFollowersFromId(twitchUser.id).then(num => num.toLocaleString(settings.Language)), true);
				if (stream) {
					embed
						.addField('\u200B', message.translate('searcher/twitch:STREAMING', { TITLE: stream.title, NUM: stream.viewer_count }))
						.setImage(stream.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080));
				}
				message.channel.send(embed);
			} else {
				message.channel.error('searcher/twitch:NOT_FOUND');
			}
			msg.delete();
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}

		// fetch basic user info (and check that user exists)
		async function getUserByUsername(login) {
			return request('/users', { login }).then(u => u && u.data[0]);
		}

		// fetch stream data from user (if user is streaming)
		async function getStreamByUsername(username) {
			return request('/streams', { user_login: username }).then(s => s && s.data[0]);
		}

		// fetches the data for other functions
		function request(endpoint, queryParams = {}) {
			const qParams = new URLSearchParams(queryParams);
			return fetch('https://api.twitch.tv/helix' + endpoint + `?${qParams.toString()}`, {
				headers: { 'Client-ID': bot.config.api_keys.twitch.clientID, 'Authorization': `Bearer ${access_token}` },
			}).then(res => res.json())
				.then(data => {
					if (data.error === 'Unauthorized') {
						return refreshTokens()
							.then(() => request(endpoint, queryParams));
					}
					return data;
				}).catch(e => console.log(e));
		}

		// Fetch follower data from user ID
		async function getFollowersFromId(id) {
			return request('/users/follows', { to_id: id }).then(u => u && u.total);
		}

		// Fetch access_token to interact with twitch API
		async function refreshTokens() {
			await fetch(`https://id.twitch.tv/oauth2/token?client_id=${bot.config.api_keys.twitch.clientID}&client_secret=${bot.config.api_keys.twitch.clientSecret}&grant_type=client_credentials`, {
				method: 'POST',
			}).then(res => res.json()).then(data => {
				access_token = data.access_token;
			}).catch(e => console.log(e));
		}
	}
};
