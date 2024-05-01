import { GuildMember, MessageReaction } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Ended giveaway reaction added event
 * @event GiveawaysManager#EndedGiveawayReactionAdded
 * @extends {Event}
*/
export default class EndedGiveawayReactionAdded extends Event {
	constructor() {
		super({
			name: 'endedGiveawayReactionAdded',
			dirname: __dirname,
			child: 'giveawayManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Giveaway} giveaway The giveaway object
	 * @param {GuildMember} member The member that added the reaction
	 * @param {MessageReaction} reaction The reaction object
	 * @readonly
	*/
	async run(client: EgglordClient, _giveaway: Giveaway, _member: GuildMember, reaction: MessageReaction) {
		if (client.config.debug) client.logger.log(`${reaction.toString()} added even though giveaway has finished`);
	}
}
