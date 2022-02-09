// Dependencies
const	Event = require('../../structures/Event');

/**
 * Giveaway deleted event
 * @event GiveawaysManager#GiveawayDeleted
 * @extends {Event}
*/
class GiveawayDeleted extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Giveaway} giveaway The giveaway object
	 * @param {Array<GuildMember>} winners The member that added the reaction
	 * @readonly
	*/
	async run(bot, giveaway) {
		if (bot.config.debug) bot.logger.debug(`Giveaway was deleted in ${giveaway.guild.id}.`);


	}
}

module.exports = GiveawayDeleted;
