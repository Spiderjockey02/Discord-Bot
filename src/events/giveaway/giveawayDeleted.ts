import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Giveaway deleted event
 * @event GiveawaysManager#GiveawayDeleted
 * @extends {Event}
*/
class GiveawayDeleted extends Event {
	constructor() {
		super({
			name: 'GiveawayDeleted',
			dirname: __dirname,
			child: 'giveawayManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Giveaway} giveaway The giveaway object
	 * @param {Array<GuildMember>} winners The member that added the reaction
	 * @readonly
	*/
	async run(client: EgglordClient, giveaway: Giveaway) {
		if (client.config.debug) client.logger.debug(`Giveaway was deleted in ${giveaway.guild.id}.`);
	}
}

module.exports = GiveawayDeleted;
