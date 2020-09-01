//Modules
const express = require('express')
const app = express()
const port = 80
const fs = require('fs')
const url = require('url');
const passport = require('passport');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const Discord = require('discord.js');
const md = require('marked');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
// For stats
const moment = require('moment');
require('moment-duration-format');
//Discord Dashboard
module.exports = (bot) => {
  bot.logger.log(`Bot dashboard is coming online`)

  //Works in background for user storage
	passport.serializeUser((user, done) => {
		done(null, user);
	});
	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});

  //Discord Ouath2 data
  passport.use(new Strategy({
		clientID: '647203942903840779',
		clientSecret: 'mZpYSfGn-474fKSGS4O5maGkJNgv7Bn4',
		callbackURL: `${bot.config.Dashboard.domain}/callback`,
		scope: ['identify', 'guilds', 'email']
	},
	(accessToken, refreshToken, profile, done) => {
		process.nextTick(() => done(null, profile));
	}));
  // Session data, used for temporary storage of your visitor's session information.
	// the `secret` is in fact a 'salt' for the data, and should not be shared publicly.
	app.use(session({
		secret: bot.config.Dashboard.sessionSecret,
		resave: false,
		saveUninitialized: false,
	}));

  // Initializes passport and session.
  app.use(passport.initialize());
	app.use(passport.session());

  //Uses EJS template
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use('/public', express.static("./dashboard/public"));  //get external files like css, js, images etc

  //Authentication Checks. checkAuth verifies regular authentication,
  //whereas checkAdmin verifies the bot owner. Those are used in url
  //endpoints to give specific permissions.
  function checkAuth(req, res, next) {
  	if (req.isAuthenticated()) return next();
  	req.session.backURL = req.url;
  	res.redirect('/login');
  }

  function cAuth(req, res) {
  	if (req.isAuthenticated()) return;
  	req.session.backURL = req.url;
  	res.redirect('/login');
  }

  function checkAdmin(req, res, next) {
  	if (req.isAuthenticated() && req.user.id === '184376969016639488') return next();
  	req.session.backURL = req.originalURL;
  	res.redirect('/');
  }

  var privacyMD = '';
	fs.readFile(`./dashboard/public/PRIVACY.md`, function(err, data) {
		if (err) {
			console.log(err);
			privacyMD = 'Error';
			return;
		}
		privacyMD = data.toString().replace().replace(/\{\{botName\}\}/g, bot.username).replace(/\{\{email\}\}/g, bot.config.Dashboard.legalTemplates.contactEmail);
		//if (client.config.dashboard.secure !== 'true') {
			//privacyMD = privacyMD.replace('Sensitive and private data exchange between the Site and its Users happens over a SSL secured communication channel and is encrypted and protected with digital signatures.', '');
		//}
	});
  var termsMD = '';
	fs.readFile(`./dashboard/public/TERMS.md`, function(err, data) {
		if (err) {
			console.log(err);
			privacyMD = 'Error';
			return;
		}
		termsMD = data.toString().replace(/\{\{botName\}\}/g, bot.username).replace(/\{\{email\}\}/g, bot.config.Dashboard.legalTemplates.contactEmail);
	});
  //Home page
  app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/index.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/index.ejs`, {
        bot: bot,
        auth: false,
        user: null,
      })
    }
    //Get IP and location (for logging)
    async function getIP() {
      var IP = req.connection.remoteAddress.slice(7)
      var country = await fetch(`http://api.db-ip.com/v2/free/${IP}`).then(url => url.json())
      bot.logger.log(`Website connection IP: ${IP}, Location:${country.city}, ${country.countryName}.`)
    }
    getIP()
  })

  //Shows stats about Egglord
  app.get('/stats', (req, res) => {
    const duration = moment.duration(bot.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
    //const members = client.guilds.reduce((p, c) => p + c.memberCount, 0);
    const members = `${bot.users.cache.filter(u => u.id !== '1').size} (${bot.users.cache.filter(u => u.id !== '1').filter(u => u.bot).size} bots)`;
    const textChannels = bot.channels.cache.filter(c => c.type === 'text').size;
    const voiceChannels = bot.channels.cache.filter(c => c.type === 'voice').size;
    const guilds = bot.guilds.cache.size;
    res.render(`../dashboard/templates/stats.ejs`, {
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
        bVersion: bot.version
      }
    });
  });

  //Legal page
  app.get('/legal', function (req, res) {
		md.setOptions({
			renderer: new md.Renderer(),
			gfm: true,
			tables: true,
			breaks: false,
			pedantic: false,
			sanitize: false,
			smartLists: true,
			smartypants: false
		});
		/*var showdown	= require('showdown');
		var	converter = new showdown.Converter(),
			textPr			= privacyMD,
			htmlPr			= converter.makeHtml(textPr),
			textTe			= termsMD,
			htmlTe			= converter.makeHtml(textTe);
		res.render(path.resolve(`${templateDir}${path.sep}legal.ejs`), {
			bot: client,
			auth: req.isAuthenticated() ? true : false,
			user: req.isAuthenticated() ? req.user : null,
			privacy: htmlPr.replace(/\\'/g, `'`),
			terms: htmlTe.replace(/\\'/g, `'`),
			edited: client.config.dashboard.legalTemplates.lastEdited
		});*/

		res.render(`../dashboard/templates/legal.ejs`, {
			bot: bot,
			auth: req.isAuthenticated() ? true : false,
			user: req.isAuthenticated() ? req.user : null,
			privacy: md(privacyMD),
			terms: md(termsMD),
			edited: bot.config.Dashboard.legalTemplates.lastEdited
		});
	});
  //Login page
  app.get('/login', (req, res, next) => {
		if (req.session.backURL) {
			req.session.backURL = req.session.backURL;
		} else if (req.headers.referer) {
			const parsed = url.parse(req.headers.referer);
			if (parsed.hostname === app.locals.domain) {
				req.session.backURL = parsed.path;
			}
		} else {
			req.session.backURL = '/';
		}
		next();
	},
	passport.authenticate('discord'));

  //Callback (Gets Discord information)
  app.get('/callback', passport.authenticate('discord', {
		failureRedirect: '/'
	}), (req, res) => {
		if (req.session.backURL) {
			res.redirect(req.session.backURL);
			req.session.backURL = null;
		} else {
			res.redirect('/');
		}
	});

  //Admin page just for Owner of Egglord
  app.get('/admin', checkAdmin, (req, res) => {
    res.render(`../dashboard/templates/admin.ejs`, {
      bot: bot,
      user: req.user,
      auth: true
    });
  });

  //Shows dashboard for Server
  app.get('/dashboard', checkAuth, (req, res) => {
    //const perms = Discord.EvaluatedPermissions;
    res.render(`../dashboard/templates/dashboard.ejs`, {
      //perms: perms,
      bot: bot,
      user: req.user,
      auth: true
    });
  });

  //Add bot to owner's server
  app.get('/add/:guildID', checkAuth, (req, res) => {
		req.session.backURL = '/dashboard';
		var inviteURL = `https://discordapp.com/api/oauth2/authorize?client_id=647203942903840779&permissions=8&redirect_uri=${bot.config.Dashboard.domain}/callback&scope=bot`;
		if (bot.guilds.cache.has(req.params.guildID)) {
			res.send('<p>The bot is already there... <script>setTimeout(function () { window.location="/dashboard"; }, 1000);</script><noscript><meta http-equiv="refresh" content="1; url=/dashboard" /></noscript>');
		} else {
			res.redirect(inviteURL);
		}
	});

  //Manage page for selected server
  app.get('/manage/:guildID', checkAuth, (req, res) => {
		const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (req.user.id === '184376969016639488') {
			console.log(`Admin bypass for managing server: ${req.params.guildID}`);
		} else if (!isManaged) {
			res.redirect('/dashboard');
		}
		res.render(`../dashboard/templates/Manage/manage.ejs`, {
			bot: bot,
			guild: guild,
			user: req.user,
			auth: true
		});
	});

  //Allows Egglord to leave selected server
  app.get('/leave/:guildID', checkAuth, async (req, res) => {
		const guild = bot.guilds.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (req.user.id === bot.config.ownerID) {
			console.log(`Admin bypass for managing server: ${req.params.guildID}`);
		} else if (!isManaged) {
			res.redirect('/dashboard');
		}
		await guild.leave();
		if (req.user.id === bot.config.ownerID) {
			return res.redirect('/admin');
		}
		res.redirect('/dashboard');
	});

  //Reset the settings for dashboard
  app.get('/reset/:guildID', checkAuth, async (req, res) => {
		const guild = bot.guilds.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (req.user.id === bot.config.ownerID) {
			console.log(`Admin bypass for managing server: ${req.params.guildID}`);
		} else if (!isManaged) {
			res.redirect('/dashboard');
		}
		bot.settings.set(guild.id, bot.config.defaultSettings);
		res.redirect(`/manage/${req.params.guildID}`);
	});

  //Show commands for EggLord
  app.get('/commands', (req, res) => {
		if (req.isAuthenticated()) {
			res.render(`../dashboard/templates/commands.ejs`, {
				bot: bot,
				auth: true,
        user: req.user
			});
		} else {
			res.render(`../dashboard/templates/commands.ejs`, {
				bot: bot,
				auth: false,
				user: null
			});
		}
	});
  //
  //Moderation pages
  //
  // custom commands
  app.get('/manage/:guildID/commands', checkAuth, (req,res) => {
    const guild = bot.guilds.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
	   if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/customcommands.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/customcommands.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Custom command (POST -updates server settings)

  //Level
  app.get('/manage/:guildID/level', checkAuth, (req,res) => {
    const guild = bot.guilds.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
    if (!isManaged) {
      res.redirect('/dashboard');
    }
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/level.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/level.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Level (POST -updates server settings)

  //Leaderboard (global)
  app.get('/leaderboard/:guildID', checkAuth, (req,res) => {
    //Checks is user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/leaderboard.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/leaderboard.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Moderation
  app.get('/manage/:guildID/moderation', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/moderator.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/moderator.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Moderation (POST -updates server settings)

  //Music
  app.get('/manage/:guildID/music', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/music.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/music.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Music (POST -updates server settings)

  //Reaction roles
  app.get('/manage/:guildID/reaction_roles', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/reaction.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/reaction.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Reaction roles (POST -updates server settings)

  //Reddit
  app.get('/manage/:guildID/reddit', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/reddit.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/reddit.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Reddit (POST -updates server settings)

  //search
  app.get('/manage/:guildID/search', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/search.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/search.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Search (POST -updates server settings)

  //timers
  app.get('/manage/:guildID/timers', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/timers.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/timers.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Timer (POST -updates server settings)

  //twitter
  app.get('/manage/:guildID/twitter', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/twitter.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/twitter.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Twitter (POST -updates server settings)

  //welcome
  app.get('/manage/:guildID/welcome', checkAuth, async (req, res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
    //console.log(guild.id)
    var Guildsettings = await bot.getGuild(guild)
    //console.log(Guildsettings)
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
	  if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/welcome.ejs`, {
        bot: bot,
        auth: true,
        user: req.user,
        guild: guild,
        Guildsettings: Guildsettings,
      })
    } else {
      res.render(`../dashboard/templates/Manage/welcome.ejs`, {
        bot: bot,
        auth: false,
        user: null,
      })
    }
  })
  //Welcome (POST -updates server settings)
  app.post('/manage/:guildID/welcome', checkAuth, (req, res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/');
		}
		const settings = bot.getGuild(guild.id);
    //Update settings
    data = req.body
    console.log(data)
    //convert data from website to database readable
    var welcomeEnabled = (data.welcome_enabled) ? true : false
    var txtmessage = data.txt_message
    var txtchannel = data.txt_channel
    var pvtEnabled = (data.pvtMessage_enabled) ? true : false
    var pvtmessage = data.pvt_message
    var roleEnabled = (data.roles_enabled) ? true : false
    var roleUsers = data.role_users
    var goodbyeEnabled = (data.Goodbye_enabled) ? true : false
    var goodbyemessage = data.goodbye_message
    //update bot settings
    bot.updateGuild(guild, {welcomePlugin : welcomeEnabled, welcomeChannel: txtchannel, welcomeMessage: txtmessage, welcomePvt: pvtEnabled, welcomePvtMessage: pvtmessage,
      welcomeRole: roleEnabled, welcomeRoleGive: roleUsers, welcomeGoodbye: goodbyeEnabled, welcomeGoodbyeMessage: goodbyemessage}, bot)
    res.redirect(`/manage/${req.params.guildID}/welcome`);
  })
  //youtube
  app.get('/manage/:guildID/youtube', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
		const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has('MANAGE_GUILD') : false;
		if (!isManaged) {
			res.redirect('/dashboard');
		}
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/youtube.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/youtube.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Youtube (POST -updates server settings)

  //settings
  app.get('/manage/:guildID/settings', checkAuth, (req,res) => {
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/settings.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/settings.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Premium
  app.get('/manage/:guildID/premium', checkAuth, (req,res) =>{
    const guild = bot.guilds.cache.get(req.params.guildID);
		if (!guild) return res.status(404);
    //Check if user is authenticated or not
    if (req.isAuthenticated()) {
      res.render(`../dashboard/templates/Manage/premium.ejs`, {
        bot: bot,
        auth: true,
        user: req.user
      })
    } else {
      res.render(`../dashboard/templates/Manage/premium.ejs`, {
        bot: bot,
        auth: false,
        user: null
      })
    }
  })
  //Logout Page
  app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
  app.get('/robots.txt', function(req, res) {
    res.type('text/plain')
    res.send("User-agent: *\nallow: /");
  })
  //Error 404 (Keep this last)
  app.get(`*`, function(req, res) {
    res.send('<p>404 File Not Found. Please wait...<p> <script>setTimeout(function () { window.location = "/"; }, 1000);</script><noscript><meta http-equiv="refresh" content="1; url=/" /></noscript>');
  })
  //Starts the webserver
  app.listen(port, () => {
    bot.logger.log(`Bot dashboard is online`, 'ready')
  }).on('error', (err) => {
    bot.logger.log(`Error with starting dashboard: ${err.code}`,"error")
  })
}
