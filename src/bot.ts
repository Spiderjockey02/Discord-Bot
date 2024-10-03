// Dependencies
import EgglordClient from './base/Egglord';
import { promisify } from 'util';
import fs from 'fs';
import { Command, Event } from './structures';
import { ActivityType, GatewayIntentBits as FLAGS, Partials } from 'discord.js';
import { addToDatabase, fetchAllCommands } from './accessors/Command';
import('./extensions');

const readdir = promisify(fs.readdir),
	client = new EgglordClient({
		partials: [Partials.GuildMember, Partials.User, Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildScheduledEvent],
		intents: [FLAGS.AutoModerationConfiguration, FLAGS.AutoModerationExecution, FLAGS.Guilds, FLAGS.GuildMembers, FLAGS.GuildBans, FLAGS.GuildEmojisAndStickers,
			FLAGS.GuildMessages, FLAGS.GuildMessageReactions, FLAGS.DirectMessages, FLAGS.GuildVoiceStates, FLAGS.GuildInvites,
			FLAGS.GuildScheduledEvents, FLAGS.MessageContent, FLAGS.GuildModeration],
		presence: {
			status: 'online',
			activities: [{
				name: 'my mention',
				type: ActivityType.Listening,
				url: 'https://www.twitch.tv/ram5s5',
			}],
		},
	});

// Load commands
(async () => {
	// load commands
	await loadCommands();

	// load events
	await loadEvents();

	// Connect client to discord API
	const token = client.config.token;
	client.login(token).catch(e => client.logger.error(e.message));
})();

// load commands
async function loadCommands() {
	if (fs.existsSync(`${process.cwd()}/dist/commands/`)) {
		const folders = (await readdir(`${process.cwd()}/dist/commands/`)).filter((v, i, a) => a.indexOf(v) === i);

		client.logger.log('=-=-=-=-=-=-=- Loading commands: -=-=-=-=-=-=-=');
		let cmdCount = 0;

		// Load commands from file system
		for (const folder of folders) {
			if (folder == 'command.example.js') return;

			const commands = (await readdir(`${process.cwd()}/dist/commands/${folder}/`)).filter((v, i, a) => a.indexOf(v) === i);
			for (const command of commands) {
				try {
					const file = (await import(`${process.cwd()}/dist/commands/${folder}/${command}`)).default;
					const cmd = new file(client) as Command;
					client.logger.log(`Loading Command: ${cmd.help.name}`);
					await client.commandManager.add(cmd);
					cmdCount++;
				} catch (err: any) {
					client.logger.error(`Failed to load Command: ${command} due to: ${err.message}`);
				}
			}
		}

		// Ensure the commands are saved to the database (so servers know what commands to run and have access to)
		const commandsFromDB = await fetchAllCommands();
		const commandsMissingFromDB = [...client.commandManager.commands.keys()].filter(localCommand => !commandsFromDB.map(c => c.name).includes(localCommand));

		for (const command of commandsMissingFromDB) {
			await addToDatabase(command);
		}


		client.logger.ready(`=-=-=-=-=-=-=- Loaded: ${cmdCount} commands -=-=-=-=-=-=-=`);
	} else {
		client.logger.error('No Commands found to load.');
	}
}

// load events
async function loadEvents() {
	const folders = await readdir(`${process.cwd()}/dist/events/`);
	client.logger.log('=-=-=-=-=-=-=- Loading events: -=-=-=-=-=-=-=');
	let evtCount = 0;

	// Fetch all events
	for (const folder of folders) {
		const events = await readdir(`${process.cwd()}/dist/events/${folder}/`);
		for (const event of events) {
			try {
				const file = (await import(`${process.cwd()}/dist/events/${folder}/${event}`)).default;
				const evt = new file() as Event;

				// Check what mananager should handle the event
				client.logger.log(`Loading Event: ${evt.conf.name}`);
				if (evt.conf.child == undefined) client.on(evt.conf.name, (...args) => evt.run(client, ...args));
				switch (evt.conf.child) {
					case 'audioManager':
						client.audioManager?.on(evt.conf.name, (...args) => evt.run(client, ...args));
						break;
						/*
					case 'giveawayManager':
						client.giveawayManager.on(evt.conf.name, (...args) => evt.run(client, ...args));
						break;
					*/
				}
				evtCount++;
			} catch (err: any) {
				client.logger.error(`Failed to load Event: ${event} due to: ${err.message}`);
			}

		}
	}

	client.logger.ready(`=-=-=-=-=-=-=- Loaded: ${evtCount} events -=-=-=-=-=-=-=`);
}