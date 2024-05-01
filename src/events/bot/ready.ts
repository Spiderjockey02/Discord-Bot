import EgglordClient from 'src/base/Egglord';
import AudioManager from 'src/base/Audio-Manager';
import Event from 'src/structures/Event';
import http from 'src/http';
import { Events, Guild, PermissionFlagsBits } from 'discord.js';

/**
 * Ready event
 * @event Egglord#Ready
 * @extends {Event}
*/
export default class Ready extends Event {
	constructor() {
		super({
			name: Events.ClientReady,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {EgglordClient} client The instantiating client
	 * @readonly
	*/
	async run(client: EgglordClient) {
		// Load up audio player
		try {
			client.audioManager = new AudioManager(client);
			client.audioManager?.init(client.user.id);
		} catch (err: any) {
			client.logger.error(`Audio manager failed to load due to error: ${err.message}`);
		}

		// Run the HTTP API server
		try {
			await http(client);
		} catch (err: any) {
			console.log(err.message);
		}

		// Delete server settings on servers that removed the client while it was offline
		const guildsOnDB = await client.databaseHandler.guildManager.fetchAll();
		const guildsRemovedWhenOffline = 0;
		for (const guildOnDB of guildsOnDB) {
			const guild = client.guilds.cache.get(guildOnDB.id);
			if (guild == undefined) client.emit('guildDelete', { id: guildOnDB.id, name: guildOnDB.name } as Guild);
		}
		if (guildsRemovedWhenOffline > 0) client.logger.ready(`Number of guilds left when offline: ${guildsRemovedWhenOffline}.`);

		// Check for any user-specific features
		const usersOnDB = await client.databaseHandler.userManager.fetchAll();
		if (usersOnDB.length > 0) client.logger.log(`Preparing ${usersOnDB.length} users.`);
		for (const userOnDB of usersOnDB) {
			try {
				const user = await client.users.fetch(userOnDB.id);
				user.isPremiumTo = userOnDB.isPremiumTo;
				user.isContributor = userOnDB.isContributor;
				user.isDev = userOnDB.isDev;
				user.isSupport = userOnDB.isSupport;
			} catch (err: any) {
				client.logger.error(`Failed to fetch user ID: ${userOnDB.id}`);
			}
		}

		// Make sure 'SupportServer' has Host commands
		if (client.config.supportServer.guildId) {
			const guild = client.guilds.cache.get(client.config.supportServer.guildId);
			if (guild) {
				// Check if Main server already have 'Host' commands
				const guildCmds = await guild.commands.fetch();
				if (!(guildCmds.find(cmd => cmd.name == 'reload'))) {
					// Add host commands to Support server as they don't have them
					const cmds = await client.loadInteractionGroup('Host', guild.id);
					for (const cmd of cmds) {
						cmd.defaultMemberPermissions = [PermissionFlagsBits.Administrator];
					}
					if (Array.isArray(cmds)) await client.guilds.cache.get(guild.id)?.commands.set(cmds);
					client.logger.log(`Added Host commands to Support server: ${guild.id}.`);
				}
			} else {
				client.logger.error('client is not in Support server.');
			}
		}

		// LOG that the client is ready to be interacted with
		client.logger.ready('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
		client.logger.ready(`${client.user.displayName}, ready to serve [${client.guilds.cache.size}] servers.`);
		client.logger.ready('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	}
}

