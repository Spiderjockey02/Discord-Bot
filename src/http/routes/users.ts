import { Router } from 'express';
import EgglordClient from '../../base/Egglord';
const router = Router();

export function run(client: EgglordClient) {
	// statistics page
	router.get('/', async (req, res) => {
		const userId = req.query.userId;
		const guildIds = req.query.guildIds;

		// Check that queries are valid
		if (typeof userId !== 'string') return res.status(400).json({ error: 'Missing user ID'	});
		if (typeof guildIds !== 'string') return res.status(400).json({ error: 'Missing array of guild ID\'s'	});

		// Create the guild array to check
		const guilds = guildIds.split(',');

		// Now fetch all guilds
		const guildsInCommon = [];
		for (const guild of guilds) {
			const guildMember = await client.guilds.cache.get(guild)?.members.fetch(userId);
			if (guildMember !== undefined) guildsInCommon.push(guild);
		}

		res.json({ guilds: guildsInCommon });
	});

	return router;
}
