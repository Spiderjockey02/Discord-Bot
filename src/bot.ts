// Dependencies
import EgglordClient from './base/Egglord';
import { promisify } from 'util';
import fs from 'fs';
import Event from './structures/Event';
import('./extensions');

const readdir = promisify(fs.readdir),
	client = new EgglordClient();

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
		for (const folder of folders) {
			if (folder == 'command.example.js') return;

			const commands = (await readdir(`${process.cwd()}/dist/commands/${folder}/`)).filter((v, i, a) => a.indexOf(v) === i);
			for (const command of commands) {
				const cmd = await import(`${process.cwd()}/dist/commands/${folder}/${command}`);
				client.commandManager.add(new cmd());
				cmdCount++;
			}
		}

		client.logger.log(`=-=-=-=-=-=-=- Loaded: ${cmdCount} commands -=-=-=-=-=-=-=`);
	} else {
		client.logger.error('No Commands found to load.');
	}
}

// load events
async function loadEvents() {
	const folders = await readdir(`${process.cwd()}/dist/events/`);
	client.logger.log('=-=-=-=-=-=-=- Loading events: -=-=-=-=-=-=-=');

	// Fetch all events
	for (const folder of folders) {
		const events = await readdir(`${process.cwd()}/dist/events/${folder}/`);
		for (const event of events) {
			const t = (await import(`${process.cwd()}/dist/events/${folder}/${event}`)).default;
			const evt = new t() as Event;
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
		}
	}
}

// handle unhandledRejection errors
process.on('unhandledRejection', (err: any) => {
	client.logger.error(`Unhandled promise rejection: ${err.message}.`);
});
