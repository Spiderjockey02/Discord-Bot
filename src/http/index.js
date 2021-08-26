const express = require('express'),
	app = express(),
	port = 3000,
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	cors = require('cors');

module.exports = async bot => {
	const routes = (await readdir('./src/http/routes')).filter((v, i, a) => a.indexOf(v) === i);
	const endpoints = [];

	// IP logger
	app.use(function(req, res, next) {
		if (req.originalUrl == '/favicon.ico' || !bot.config.debug) return;
		bot.logger.log(`IP: ${req.connection.remoteAddress.slice(7)} -> ${req.originalUrl}`);
		next();
	});

	// Get all routes
	for (const route of routes) {
		if (route !== 'index.js') {
			app.use(`/${route.replace('.js', '')}`, require(`./routes/${route}`)(bot));
			endpoints.push(`${route.replace('.js', '')}:`, ...(require(`./routes/${route}`)(bot).stack.map(item => `\t ${item.route.path}`).filter((v, i, a) => a.indexOf(v) === i && v !== '/')));
		}
	}

	// Create web server
	app
		.use(cors())
		.disable('x-powered-by')
		.get('/', (req, res) => {
			res
				.type('text/plain')
				.send([
					`API server for ${bot.user.tag}`,
					'Endpoints:',
					endpoints.join('\n'),
				].join('\n'));
		})
		// Make sure web scrapers aren't used
		.get('/robots.txt', function(req, res) {
			res
				.type('text/plain')
				.send('User-agent: *\ndisallow: /');
		})
		.get('*', async function(req, res) {
			res.send('No data here. Go away!');
		})
		// Run the server
		.listen(port, () => {
			bot.logger.ready(`Statistics API has loaded on port:${port}`);
		})
		.on('error', (err) => {
			bot.logger.error(`Error with starting HTTP API: ${err.message}`);
		});
};
