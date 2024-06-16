import { Router } from 'express';
import EgglordClient from '../../base/Egglord';
const router = Router();

// Command page
export function run(client: EgglordClient) {
	// List of all commands
	router.get('/', (_req, res) => {

		// show list of commands
		const categories = client.commandManager.commands
			.map(c => c.help.category)
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort((a, b) => a.localeCompare(b))
			.map(category => ({
				name: category,
				commands: client.commandManager.commands.filter(c => c.help.category === category)
					.sort((a, b) => a.help.name.localeCompare(b.help.name))
					.map(c => ({ ...c,
						conf: {
							...c.conf,
							userPermissions: c.conf.userPermissions.map(p => p.toString()),
							botPermissions: c.conf.botPermissions.map(p => p.toString()),
						},
					})),
			}));
		res.status(200).json({ categories });
	});

	// JSON view of all commands
	router.get('/json', (_req, res) => {

		res.status(200).json([...client.commandManager.commands.map(c => Object.assign(c, { conf: {
			botPermissions: c.conf.botPermissions.map(i => Number(i)),
			userPermissions: c.conf.userPermissions.map(i => Number(i)),
		} }))]);
	});

	// Show information on a particular command
	router.get('/:command', (req, res) => {

		// check if command exists
		const command = client.commandManager.commands.get(req.params.command);
		if (command !== undefined) {
			res
				.status(200)
				.json({ command: { ...command, conf: {
					botPermissions: command.conf.botPermissions.map(i => Number(i)),
					userPermissions:command.conf.userPermissions.map(i => Number(i)),
				} } });
		} else {
			res.status(400).json({ error: 'Invalid command!' });
		}
	});

	return router;
}