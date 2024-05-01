import { Events, Guild } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';
const unavailableGuilds: string[] = [];

/**
 * Guild unavailable event
 * @event Egglord#GuildUnavailable
 * @extends {Event}
*/
export default class GuildUnavailable extends Event {
	constructor() {
		super({
			name: Events.GuildUnavailable,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Guild} guild The guild that has become unavailable
	 * @readonly
	*/
	async run(client: EgglordClient, guild: Guild) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Guild: ${guild.name} has become unavailable.`);

		// only show error once an hour
		if (unavailableGuilds.includes(guild.id)) {
			// remove guild from array after an error
			setTimeout(function() {
				unavailableGuilds.splice(unavailableGuilds.indexOf(guild.id), 1);
				// 1 hour interval
			}, 60 * 60 * 1000);
		} else {
			client.logger.log(`[GUILD UNAVAILABLE] ${guild.name} (${guild.id}).`);
			unavailableGuilds.push(guild.id);
		}
	}
}
