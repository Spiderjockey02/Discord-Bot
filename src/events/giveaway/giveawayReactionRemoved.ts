import { GuildMember, MessageReaction } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Giveaway reaction removed event
 * @event GiveawaysManager#GiveawayReactionRemoved
 * @extends {Event}
*/
export default class GiveawayReactionRemoved extends Event {
	constructor() {
		super({
			name: 'giveawayReactionRemoved',
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
	async run(client: EgglordClient, _giveaway: Giveaway, member: GuildMember, reaction: MessageReaction) {
		if (client.config.debug) client.logger.debug(`member: ${member.user.id} removed reaction ${reaction.emoji.name} to giveaway`);
	}
}
