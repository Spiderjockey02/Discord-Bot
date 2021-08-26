// Dependencies
const Event = require('../../structures/Event');

/**
 * Ended giveaway reaction added event
 * @event GiveawaysManager#EndedGiveawayReactionAdded
 * @extends {Event}
*/
class EndedGiveawayReactionAdded extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Giveaway} giveaway The giveaway object
	 * @param {GuildMember} member The member that added the reaction
	 * @param {MessageReaction} reaction The reaction object
	 * @readonly
	*/
	async run(bot, giveaway, member, reaction) {
		if (bot.config.debug) bot.logger.log(`${reaction.toString()} added even though giveaway has finished`);
	}
}

module.exports = EndedGiveawayReactionAdded;
