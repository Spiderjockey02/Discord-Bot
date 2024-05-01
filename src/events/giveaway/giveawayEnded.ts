import { GuildMember } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Giveaway ended event
 * @event GiveawaysManager#GiveawayEnded
 * @extends {Event}
*/
class GiveawayEnded extends Event {
	constructor() {
		super({
			name: 'giveawayEnded',
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
		if (client.config.debug) client.logger.debug(`Giveaway just ended in guild: ${giveaway.guildID} with winners: ${winners.map(m => m.user.id)}.`);

		// DM members that they have won
		for (const member of winners) {
			try {
				const embed = new EmbedBuilder()
					.setAuthor({ name: 'Giveaway winner', iconURL: member.user.displayAvatarURL() })
					.setThumbnail(client.guilds.cache.get(giveaway.guildId)?.iconURL())
					.setDescription([
						`Prize: \`${giveaway.prize}\`.`,
						`Message link: [link](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}).`,
					].join('\n'));
				await member.send({ embeds: [embed] });
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = GiveawayEnded;
