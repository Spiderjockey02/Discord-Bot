// Dependencies
const Event = require('../../structures/Event');

/**
 * Giveaway reaction removed event
 * @event GiveawaysManager#GiveawayReactionRemoved
 * @extends {Event}
*/
class GiveawayReactionRemoved extends Event {
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
		if (bot.config.debug) bot.logger.debug(`member: ${member.user.id} removed reaction ${reaction._emoji.name} to giveaway`);
	}
}

module.exports = GiveawayReactionRemoved;
