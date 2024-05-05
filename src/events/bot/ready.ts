import { Event } from '../../structures';
import AudioManager from '../../base/Audio-Manager';
import EgglordClient from '../../base/Egglord';
import http from '../../http';
import { Events } from 'discord.js';
import LevelManager from '../../helpers/LevelManager';

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
			console.log(err);
			client.logger.error(`Audio manager failed to load due to error: ${err.message}`);
		}

		// Run the HTTP API server
		try {
			await http(client);
		} catch (err: any) {
			console.log(err);
			console.log(err.message);
		}

		// Get server settings on servers that removed the client while it was offline
		const guildsOnDB = await client.databaseHandler.guildManager.fetchAll();
		for (const guild of guildsOnDB) {
			// Check if guild is with this bot
			const cachedGuild = client.guilds.cache.get(guild.id);
			if (cachedGuild) {

				// Check for all the settings
				const settings = await client.databaseHandler.guildManager.fetchSettingsById(cachedGuild.id);
				cachedGuild.settings = settings;
				console.log(settings?.levelSystem);
				cachedGuild.levels = (settings?.levelSystem) ? new LevelManager(client, cachedGuild.id) : null;
			}
		}

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
		/*
		if (client.config.SupportServer.GuildID) {
			const guild = client.guilds.cache.get(client.config.SupportServer.GuildID);
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
		*/
		// LOG that the client is ready to be interacted with
		client.logger.ready('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
		client.logger.ready(`${client.user.displayName}, ready to serve [${client.guilds.cache.size}] servers.`);
		client.logger.ready('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	}
}

