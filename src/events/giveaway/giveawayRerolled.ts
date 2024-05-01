import Event from 'src/structures/Event';
import { EmbedBuilder, GuildMember } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Giveaway rerolled event
 * @event GiveawaysManager#GiveawayRerolled
 * @extends {Event}
*/
export default class GiveawayRerolled extends Event {
	constructor() {
		super({
			name: 'giveawayRerolled',
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
	async run(client: EgglordClient, giveaway: Giveaway, winners: GuildMember[]) {
		if (client.config.debug) client.logger.log('giveaway has rerolled');

		// DM members that they have won
		for (const winner of winners) {
			try {
				const embed = new EmbedBuilder()
					.setAuthor({ name: 'Giveaway winner', iconURL: winner.user.displayAvatarURL() })
					.setThumbnail(client.guilds.cache.get(giveaway.guildID)?.iconURL())
					.setDescription([
						`Prize: \`${giveaway.prize}\`.`,
						`Message link: [link](https://discord.com/channels/${giveaway.guildID}/${giveaway.channelID}/${giveaway.messageID}).`,
					].join('\n'));
				await winner.send({ embeds: [embed] });
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
