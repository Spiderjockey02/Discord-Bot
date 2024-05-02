import express from 'express';
import cors from 'cors';
import EgglordClient from 'src/base/Egglord';
import { ExtendedRequest, ExtendedResponse } from 'src/types';
import config from '../config';
const app = express();

export default async function(client: EgglordClient) {
	// IP logger
	app
		.use(cors())
		.disable('x-powered-by')
		.use((req, res, next) => {
			if (req.originalUrl !== '/favicon.ico' || config.debug) {
				// Handle custom rate limits
				const newReq = req as ExtendedRequest;
				const newRes = res as ExtendedResponse;

				// Add time to request
				newReq._startTime = new Date().getTime();
				newReq._endTime = 0;

				// Add time to response
				newRes._startTime = new Date().getTime();
				newRes._endTime = 0;

				// Run logger
				client.logger.connection(newReq, newRes);
			}
			next();
		})
		.use((req, res, next) => {
			if (config.API.secure && config.API.token !== req.query.token) {
				return res.json({ error: 'Invalid API token' });
			}
			next();
		})
		.use('/api/commands', (await import('./routes/commands')).run(client))
		.use('/api/guilds', (await import('./routes/guilds')).run(client))
		.use('/api/logs', (await import('./routes/logs')).run())
		.use('/api/players', (await import('./routes/players')).run(client))
		.use('/api/statistics', (await import('./routes/statistics')).run(client))
		.use('/api/users', (await import('./routes/users')).run(client))
		// Make sure web scrapers aren't used
		.get('/robots.txt', function(_req, res) {
			res
				.type('text/plain')
				.send('User-agent: *\ndisallow: /');
		})
		.get('*', async function(_req, res) {
			res.send('No data here. Go away!');
		})
		// Run the server
		.listen(config.API.port, () => {
			client.logger.ready(`Statistics API has loaded on port:${config.API.port}`);
		})
		.on('error', (err) => {
			client.logger.error(`Error with starting HTTP API: ${err.message}`);
		});
}

