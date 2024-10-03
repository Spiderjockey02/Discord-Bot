import { Event } from '../../structures';
import AudioManager from '../../base/Audio-Manager';
import EgglordClient from '../../base/Egglord';
import http from '../../http';
import { ApplicationCommandDataResolvable, Events, PermissionFlagsBits } from 'discord.js';
import LevelManager from '../../helpers/LevelManager';
import TicketManager from '../../helpers/TicketManager';

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
		} catch (err) {
			console.log(err);
			client.logger.error(`Audio manager failed to load due to error: ${err}`);
		}

		// Run the HTTP API server
		try {
			await http(client);
		} catch (err) {
			console.log(err);
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

				// Level system
				if (settings?.levelSystem) {
					client.logger.debug(`Guild: ${guild.id} has enabled the level system.`);
					cachedGuild.levels = new LevelManager(client, cachedGuild.id);
				}

				// Ticket system
				if (settings?.ticketSystem) {
					client.logger.debug(`Guild: ${guild.id} has enabled the ticket system.`);
					cachedGuild.tickets = new TicketManager(client, cachedGuild.id);
				}
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
			} catch {
				client.logger.error(`Failed to fetch user ID: ${userOnDB.id}`);
			}
		}

		// Make sure 'SupportServer' has Host commands
		if (client.config.SupportServer.GuildID) {
			const guild = client.guilds.cache.get(client.config.SupportServer.GuildID);
			if (guild) {
				const cmds = await client.commandManager.commands.filter(c => c.help.category == 'Host');
				const commandData = [];

				for (const cmd of [...cmds.values()]) {
					if (cmd.conf.slash) {
						const item: ApplicationCommandDataResolvable = {
							name: cmd.help.name,
							description: cmd.help.description,
							nsfw: cmd.conf.nsfw,
							defaultMemberPermissions: PermissionFlagsBits.Administrator,
							options: [],
						};
						if (cmd.conf.options.length > 0) item.options = cmd.conf.options;
						commandData.push(item);
					}
				}

				await guild.commands.set(commandData);
				client.logger.log(`Owner-only commands have been loaded in server: ${guild.id}.`);
			} else {
				client.logger.error('Client is not in Support server.');
			}
		}

		// LOG that the client is ready to be interacted with
		client.logger.ready('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
		client.logger.ready(`${client.user.displayName}, ready to serve [${client.guilds.cache.size}] servers.`);
		client.logger.ready('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	}
}

