// Modules
const express = require('express');
const app = express();
const url = require('url');
const passport = require('passport');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const favicon = require('serve-favicon');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const md = require('marked');
const http = require('http');
// For stats
const moment = require('moment');
require('moment-duration-format');
// Discord Dashboard
module.exports = (bot) => {
	bot.logger.log('Bot dashboard is coming online');

	// Works in background for user storage
	passport.serializeUser((user, done) => {
		done(null, user);
	});
	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});

	// Each page can be accessed 5 times within a minute
	const limiter = new rateLimit({
		// 1 minute
		windowMs: 1 * 60 * 1000,
		max: 100,
	});
	app.use(limiter);
	// Discord Ouath2 data
	passport.use(new Strategy({
		clientID: bot.appInfo.id,
		clientSecret: bot.config.botClient,
		callbackURL: `${bot.config.Dashboard.domain}/callback`,
		scope: ['identify', 'guilds'],
	}, (accessToken, refreshToken, profile, done) => {
		process.nextTick(() => done(null, profile));
	}));
	// Session data, used for temporary storage of your visitor's session information.
	// the `secret` is in fact a 'salt' for the data, and should not be shared publicly.
	app.use(session({
		secret: bot.config.Dashboard.sessionSecret,
		resave: false,
		saveUninitialized: false,
		secure: true,
	}));

	// Initializes passport and session.
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(favicon('./src/modules/website/public/img/favicon.ico'));

	// Uses EJS template
	app.engine('html', require('ejs').renderFile);
	app.set('view engine', 'html');
	app.use(bodyParser.urlencoded({
		extended: true,
	}));
	// get external files like css, js, images etc
	app.use(express.static('./src/modules/website/public'));

	// Get privacy and terms and condition text
	let privacyMD = '';
	fs.readFile('./src/modules/website/public/PRIVACY.md', function(err, data) {
		if (err) {
			console.log(err);
			privacyMD = 'Error';
			return;
		}
		privacyMD = data.toString().replace().replace(/\{\{botName\}\}/g, bot.user.username).replace(/\{\{email\}\}/g, bot.config.Dashboard.legalTemplates.contactEmail);
	// if (client.config.dashboard.secure !== 'true') {
		// privacyMD = privacyMD.replace('Sensitive and private data exchange between the Site and its Users happens over a SSL secured communication channel and is encrypted and protected with digital signatures.', '');
	// }
	});
	let termsMD = '';
	fs.readFile('./src/modules/website/public/TERMS.md', function(err, data) {
		if (err) {
			console.log(err);
			termsMD = 'Error';
			return;
		}
		termsMD = data.toString().replace(/\{\{botName\}\}/g, bot.user.username).replace(/\{\{email\}\}/g, bot.config.Dashboard.legalTemplates.contactEmail);
	});

	// Checks to see if ser is logged in
	function checkAuth(req, res, next) {
		if (req.isAuthenticated()) return next();
		req.session.backURL = req.url;
		res.redirect('/login');
	}

	// Checks for server bot owner
	function checkAdmin(req, res, next) {
		if (req.isAuthenticated() && req.user.id === bot.config.ownerID) return next();
		req.session.backURL = req.originalURL;
		res.redirect('/');
	}
	// Get IP and location (for logging)
	async function getIP(req) {
		const IP = req.connection.remoteAddress.slice(7);
		const country = await fetch(`http://api.db-ip.com/v2/free/${IP}`).then(info => info.json());
		if (IP != '86.25.177.233') {
			return country;
		}
	}
	// Home page
	app.get('/', async function(req, res) {
		if (req.isAuthenticated()) {
			res.render('../src/modules/website/templates/index.ejs', {
				bot: bot,
				auth: true,
				user: req.user,
			});
		} else {
			res.render('../src/modules/website/templates/index.ejs', {
				bot: bot,
				auth: false,
				user: null,
			});
		}
		const country = await getIP(req);
		bot.logger.log(`Connection IP: ${country.ipAddress}, Location:${country.city}, ${country.countryName}.`, 'website');
	});

	// Login page
	app.get('/login', (req, res, next) => {
		if (req.session.backURL) {
			req.session.backURL;
		} else if (req.headers.referer) {
			const parsed = url.parse(req.headers.referer);
			if (parsed.hostname === app.locals.domain) {
				req.session.backURL = parsed.path;
			}
		} else {
			req.session.backURL = '/';
		}
		next();
	}, passport.authenticate('discord'));

	// Callback (Gets User's information allowing user to be logged in)
	app.get('/callback', passport.authenticate('discord', {
		failureRedirect: '/',
	}), async (req, res) => {
		if (req.session.backURL) {
			res.redirect(req.session.backURL);
			req.session.backURL = null;
		} else {
			res.redirect('/servers');
		}
		const country = await getIP(req);
		bot.logger.log(`${res.req.user.username}#${res.req.user.discriminator} has logged on with IP: ${country.ipAddress} (${country.city}, ${country.countryName})`, 'website');
	});

	// Add Bot to server
	app.get('/add/:guildID', checkAuth, (req, res) => {
		req.session.backURL = '/servers';
		const inviteURL = `https://discordapp.com/api/oauth2/authorize?client_id=${bot.config.botID}&permissions=8&scope=bot&guild_id=${req.params.guildID}`;
		if (bot.guilds.cache.has(req.params.guildID)) {
			res.send('<p>The bot is already there... <script>setTimeout(function () { window.location="/servers"; }, 1000);</script><noscript><meta http-equiv="refresh" content="1; url=/dashboard" /></noscript>');
		} else {
			res.redirect(inviteURL);
		}
	});

	// Invite bot to server and makes them login and then directs them to manage page
	app.get('/invite', (req, res) => {
		if (req.isAuthenticated()) {
			res.redirect('/servers');
		} else {
			const inviteURL = `https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=${bot.config.botID}&permissions=8&scope=bot+identify+guilds&redirect_uri=${bot.config.Dashboard.domain}/callback`;
			res.redirect(inviteURL);
			// get guild that was added
			// redirect to that server's dashboard
		}
	});

	// Show the commands that the bot do
	app.get('/commands', (req, res) => {
		res.render('../src/modules/website/templates/navbar/commands.ejs', {
			bot: bot,
			auth: req.isAuthenticated() ? true : false,
			user: req.isAuthenticated() ? req.user : null,
		});
	});

	// Shows basic information to the users
	app.get('/status', (req, res) => {
		const duration = moment.duration(bot.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
		// const members = client.guilds.reduce((p, c) => p + c.memberCount, 0);
		const members = `${bot.users.cache.filter(u => u.id !== '1').size} (${bot.users.cache.filter(u => u.id !== '1').filter(u => u.bot).size} bots)`;
		const textChannels = bot.channels.cache.filter(c => c.type === 'text').size;
		const voiceChannels = bot.channels.cache.filter(c => c.type === 'voice').size;
		const guilds = bot.guilds.cache.size;
		res.render('../src/modules/website/templates/navbar/status.ejs', {
			bot: bot,
			auth: req.isAuthenticated() ? true : false,
			user: req.isAuthenticated() ? req.user : null,
			stats: {
				servers: guilds,
				members: members,
				text: textChannels,
				voice: voiceChannels,
				uptime: duration,
				commands: bot.commands.size,
				memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
				dVersion: Discord.version,
				nVersion: process.version,
				bVersion: bot.config.Dashboard.version,
			},
		});
	});

	app.get('/privacy', function(req, res) {
		md.setOptions({
			renderer: new md.Renderer(),
			gfm: true,
			tables: true,
			breaks: false,
			pedantic: false,
			sanitize: false,
			smartLists: true,
			smartypants: false,
		});
		res.render('../src/modules/website/templates/extras/legal.ejs', {
			bot: bot,
			auth: req.isAuthenticated() ? true : false,
			user: req.isAuthenticated() ? req.user : null,
			privacy: md(privacyMD),
			terms: md(termsMD),
			edited: bot.config.Dashboard.legalTemplates.lastEdited,
		});
	});

	// Logout the user
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// Show the servers that the user can manage
	app.get('/servers', function(req, res) {
		if (req.isAuthenticated()) {
			res.render('../src/modules/website/templates/navbar/server.ejs', {
				bot: bot,
				auth: true,
				user: req.user,
				Permissions: Discord.Permissions,
			});
		} else {
			res.redirect('/login');
		}
	});

	// Manage page for selected server
	app.get('/manage/:guildID', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			// Make sure user can access this
			const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
			if (isManaged) {
				// Announces in console if a bot owner is editing a server
				if (req.user.id === bot.config.ownerID) {
					bot.logger.log(`${res.req.user.username}#${res.req.user.discriminator} is accessing server: [${guild.id}]`, 'website');
				}
				// Get server settings renders page
				const settings = await bot.getGuild(guild);
				res.render('../src/modules/website/templates/plugins/dashboard.ejs', {
					bot: bot,
					guild: guild,
					user: req.user,
					auth: true,
					settings: settings,
				});
			} else {
				res.redirect('/');
			}
		}
	});

	// //////////////////////////////////////////////////////////
	//                                                         //
	//	                  Plugin Section                       //
	//                                                         //
	// //////////////////////////////////////////////////////////

	// Load welcome plugin
	app.get('/manage/:guildID/welcome', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
			if (isManaged) {
				// Get server settings renders page
				const settings = await bot.getGuild(guild);
				if (settings.welcomePlugin == false) {
					bot.updateGuild(guild, { welcomePlugin: true });
				}
				res.render('../src/modules/website/templates/plugins/welcome.ejs', {
					bot: bot,
					guild: guild,
					user: req.user,
					auth: true,
					settings: settings,
				});
			} else {
				res.redirect('/');
			}
		}
	});

	// Update welcome settinsg
	app.post('/manage/:guildID/welcome', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			console.log(req.body);
			// update database
			const messageToggle = (req.body['wm-toggle']) ? true : false;
			const privateToggle = (req.body['pm-toggle']) ? true : false;
			const roleToggle = (req.body['rg-toggle']) ? true : false;
			const goodbyeToggle = (req.body['lm-toggle']) ? true : false;
			// cleanse text (Make sure its gonna be enabled before updating)
			const messageText = req.body.wl_message;
			const pvt_message = req.body.pvt_message;
			const lv_message = req.body.lv_message;
			console.log('1');
			let welcomechannel, data;
			if (req.body.welcomeMessageChannel !== 'Please select a channel') {
				// Channel is an actual channel
				data = { welcomeMessageChannel: req.body.welcomeMessageChannel, welcomeMessageToggle: messageToggle, welcomePrivateToggle: privateToggle, welcomeRoleToggle: roleToggle, welcomeGoodbyeToggle: goodbyeToggle,
					welcomeMessageText:  messageText, welcomePrivateText: pvt_message, welcomeGoodbyeText: lv_message };
			} else {
				data = { welcomeMessageToggle: messageToggle, welcomePrivateToggle: privateToggle, welcomeRoleToggle: roleToggle, welcomeGoodbyeToggle: goodbyeToggle,
					welcomeMessageText:  messageText, welcomePrivateText: pvt_message, welcomeGoodbyeText: lv_message };
			}
			console.log(welcomechannel);
			// send data to database for updating
			try {
				await bot.updateGuild(guild, data);
			} catch (e) {
				bot.logger.error('An error occured saving data');
			}
			res.redirect(`/manage/${guild.id}/welcome`);
		}
	});

	// disable welcome plugin
	app.get('/manage/:guildID/welcome/disable', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			bot.updateGuild(guild, { welcomePlugin: false });
			res.redirect(`/manage/${guild.id}`);
		}
	});

	// load level plugin
	app.get('/manage/:guildID/level', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
			if (isManaged) {
				// Get server settings renders page
				const settings = await bot.getGuild(guild);
				if (settings.LevelPlugin == false) {
					bot.updateGuild(guild, { LevelPlugin: true });
				}
				res.render('../src/modules/website/templates/plugins/level.ejs', {
					bot: bot,
					guild: guild,
					user: req.user,
					auth: true,
					settings: settings,
				});
			} else {
				res.redirect('/');
			}
		}
	});
	// update level settings
	app.post('/manage/:guildID/level', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			console.log(req.body);
			let leveloption, data;
			if (req.body.LevelAnnouncement == 'Custom channel') {
				leveloption = 2;
			} else if (req.body.LevelAnnouncement == 'Disabled') {
				leveloption = 0;
			} else {
				leveloption = 1;
			}
			const rate = (req.body['xp-rate'] / 100);
			if (req.body.AnnoucementChannel !== 'Please select a channel') {
				// Channel is an actual channel
				data = { LevelMultiplier: rate, LevelChannel: req.body.AnnoucementChannel, LevelOption: leveloption, LevelMessage: req.body.lv_message };
			} else {
				data = { LevelMultiplier: rate, LevelOption: leveloption, LevelMessage: req.body.lv_message };
			}

			bot.updateGuild(guild, data);
			if (req.body) {res.redirect(`/manage/${guild.id}/level`);}
		}
	});

	// disable level plugin
	app.get('/manage/:guildID/level/disable', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			bot.updateGuild(guild, { LevelPlugin: false });
			res.redirect(`/manage/${guild.id}`);
		}
	});


	// logging plugin
	app.get('/manage/:guildID/logging', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
			if (isManaged) {
				// Get server settings renders page
				const settings = await bot.getGuild(guild);
				if (settings.ModLog == false) {
					bot.updateGuild(guild, { ModLog: true });
				}
				res.render('../src/modules/website/templates/plugins/logging.ejs', {
					bot: bot,
					guild: guild,
					user: req.user,
					auth: true,
					settings: settings,
				});
			} else {
				res.redirect('/');
			}
		}
	});
	app.post('/manage/:guildID/logging', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			console.log(req.body);
			const keys = [];
			for(const k in req.body) keys.push(k);
			console.log(keys);
			const ignoreBotToggle = (req.body['la-toggle']) ? true : false;
			if (req.body.LOGGINGCHANNEL !== 'Please select a channel') {
				bot.updateGuild(guild, { ModLogChannel: req.body.LOGGINGCHANNEL, ModLogEvents: keys, ModLogIgnoreBot: ignoreBotToggle });
			} else {
				bot.updateGuild(guild, { ModLogEvents: keys, ModLogIgnoreBot: ignoreBotToggle });
			}
			res.redirect(`/manage/${guild.id}/logging`);
		}
	});

	// disable level plugin
	app.get('/manage/:guildID/logging/disable', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			bot.updateGuild(guild, { ModLog: false });
			res.redirect(`/manage/${guild.id}`);
		}
	});

	// moderation plugin
	app.get('/manage/:guildID/moderation', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
			if (isManaged) {
				// Get server settings renders page
				const settings = await bot.getGuild(guild);
				if (settings.ModerationPlugin == false) {
					bot.updateGuild(guild, { ModerationPlugin: true });
				}
				res.render('../src/modules/website/templates/plugins/moderation.ejs', {
					bot: bot,
					guild: guild,
					user: req.user,
					auth: true,
					settings: settings,
				});
			} else {
				res.redirect('/');
			}
		}
	});

	// update moderation settings
	app.post('/manage/:guildID/moderation', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			console.log(req.body);
			// get data
			const data = {};
			// bot.updateGuild(guild, data);
			res.redirect(`/manage/${guild.id}/moderation`);
		}
	});

	// disable moderation plugin
	app.get('/manage/:guildID/moderation/disable', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			bot.updateGuild(guild, { ModerationPlugin: false });
			res.redirect(`/manage/${guild.id}`);
		}
	});

	// moderation plugin
	app.get('/manage/:guildID/music', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
			if (isManaged) {
				// Get server settings renders page
				const settings = await bot.getGuild(guild);
				if (settings.MusicPlugin == false) {
					bot.updateGuild(guild, { MusicPlugin: true });
				}
				res.render('../src/modules/website/templates/plugins/music.ejs', {
					bot: bot,
					guild: guild,
					user: req.user,
					auth: true,
					settings: settings,
				});
			} else {
				res.redirect('/');
			}
		}
	});

	// update moderation settings
	app.post('/manage/:guildID/music', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			console.log(req.body);
			res.redirect(`/manage/${guild.id}/music`);
		}
	});

	// disable music plugin
	app.get('/manage/:guildID/music/disable', checkAuth, async (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) {
			res.redirect('/');
		} else {
			bot.updateGuild(guild, { MusicPlugin: false });
			res.redirect(`/manage/${guild.id}`);
		}
	});
	// Admin page (only accessible by bot owner(s))
	app.get('/admin', checkAdmin, (req, res) => {
		res.render('../src/modules/website/templates/navbar/admin.ejs', {
			bot: bot,
			user: req.user,
			auth: true,
		});
	});

	// help page (docs)
	app.get('/help', async function(req, res) {
		if (req.isAuthenticated()) {
			res.render('../src/modules/website/templates/navbar/help.ejs', {
				bot: bot,
				auth: true,
				user: req.user,
			});
		} else {
			res.render('../src/modules/website/templates/navbar/help.ejs', {
				bot: bot,
				auth: false,
				user: null,
			});
		}
	});

	// premium page
	app.get('/premium', async function(req, res) {
		if (req.isAuthenticated()) {
			res.render('../src/modules/website/templates/navbar/premium.ejs', {
				bot: bot,
				auth: true,
				user: req.user,
			});
		} else {
			res.render('../src/modules/website/templates/navbar/premium.ejs', {
				bot: bot,
				auth: false,
				user: null,
			});
		}
	});

	// For web scrapers
	app.get('/robots.txt', function(req, res) {
		res.type('text/plain');
		res.send('User-agent: *\nallow: /\n\nUser-agent: *\ndisallow: /manage');
	});

	// Error 404 (Keep this last)
	app.get('*', async function(req, res) {
		res.send('<p>404 File Not Found. Please wait...<p> <script>setTimeout(function () { window.location = "/"; }, 1000);</script><noscript><meta http-equiv="refresh" content="1; url=/" /></noscript>');
	});

	if (bot.config.Dashboard.Protocol == 'https') {
		// create HTTP server
		http.createServer(function(req, res) {
			res.writeHead(301, { 'Location': `${bot.config.Dashboard.domain}` });
			res.end();
		}).listen(80, () => {
			bot.logger.log('Bot dashboard is online, running on port: 80', 'ready');
		}).on('error', (err) => {
			bot.logger.log(`Error with starting dashboard: ${err.code}`, 'error');
		});
		// create HTTPS server
		const httpsServer = https.createServer({
			key: fs.readFileSync('./src/modules/website/selfsigned.key', 'utf-8'),
			cert: fs.readFileSync('./src/modules/website/selfsigned.crt', 'utf-8'),
		}, app);

		httpsServer.listen(443, () => {
			bot.logger.log('Bot dashboard is online, running on port: 443', 'ready');
		}).on('error', (err) => {
			bot.logger.log(`Error with starting dashboard: ${err.code}`, 'error');
		});
	} else {
		// If protocol is not https
		app.listen(80, () => {
			bot.logger.log('Bot dashboard is online', 'ready');
		}).on('error', (err) => {
			bot.logger.log(`Error with starting dashboard: ${err.code}`, 'error');
		});
	}


	// Starts the webserver
	// httpsServer.listen(port, () => {
	// bot.logger.log('Bot dashboard is online', 'ready');
	// }).on('error', (err) => {
	// bot.logger.log(`Error with starting dashboard: ${err.code}`, 'error');
	// });
};
