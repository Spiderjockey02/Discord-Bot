import { GuildMember, MessageReaction } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Giveaway reaction added event
 * @event GiveawaysManager#GiveawayReactionAdded
 * @extends {Event}
*/
export default class GiveawayReactionAdded extends Event {
	constructor() {
		super({
			name: 'giveawayReactionAdded',
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
		if (client.config.debug) client.logger.debug(`member: ${member.user.id} added reaction ${reaction.emoji.name} to giveaway`);
	}
}
