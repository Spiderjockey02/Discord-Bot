// Dependencies
const	Event = require('../../structures/Event'),
	{ MessageEmbed } = require('discord.js');

/**
 * Ratelimit event
 * @event Egglord#RateLimit
 * @extends {Event}
*/
class RateLimit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {object} RateLimitData Object containing the rate limit info
	 * @param {string} RateLimitData.route The route of the request relative to the HTTP endpoint
	 * @param {number} RateLimitData.timeout Time until this rate limit ends, in ms
	 * @readonly
	*/
	async run(bot, { route, timeout, limit }) {
		bot.logger.error(`Rate limit: ${route} (Cooldown: ${timeout}ms)`);

		const embed = new MessageEmbed()
			.setTitle('RateLimit hit')
			.setColor('RED')
			.addField('Path', route)
			.addField('Limit', `${limit}`, true)
			.addField('Cooldown', `${timeout}ms`, true)
			.setTimestamp();

		const modChannel = await bot.channels.fetch(bot.config.SupportServer.rateLimitChannelID).catch(() => bot.logger.error('Error fetching rate limit logging channel'));
		if (modChannel) bot.addEmbed(modChannel.id, [embed]);
	}
}

module.exports = RateLimit;
