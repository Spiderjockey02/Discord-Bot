const { Colors } = require('discord.js');

const config = {
	ownerID: ['YourAccountID'],
	token: 'YourBotToken',
	// For looking up Twitch, Fortnite, Steam accounts
	api_keys: {
		// https://genius.com/developers
		genius: 'genuisAPI-KEY',
		// https://api.amethyste.moe/
		amethyste: 'amethysteAPI-Key',
		// https://api.egglord.dev/settings
		masterToken: '',
	},
	// add plugins/commands here if you don't want them loaded in the bot.
	disabledCommands: [],
	disabledPlugins: [],
	websiteURL: 'Bot\'s dashboard',
	// your support server
	SupportServer: {
		// Link to your support server
		link: 'https://discord.gg/8g6zUQu',
		// Your support's server ID
		GuildID: '750822670505082971',
		// This for using the suggestion command on your server
		ModRole: '751857618720522341',
		// What channel to post the suggestions
		SuggestionChannel: '761619652009787392',
		// Where the bot will send Guild join/leave messages to
		GuildChannel: '761619652009787392',
		// Where rate limits will be sent to, for investigation
		rateLimitChannelID: '761612724370931722',
	},
	API: {
		port: 3000,
		secure: true,
		token: '123456789',
	},
	// Native music-player providers. Leave disabledProviders empty to enable all.
	Music: {
		// Names: youtube, soundcloud, tidal, spotify, applemusic, deezer, yandex, vk, qobuz, jiosaavn, mixcloud,
		// ocremix, clypit, reddit, getyarn, tiktok, soundgasm, pixeldrain, tumblr, pornhub, flowerytts,
		// speechtts, streamdeck, upload, direct, http (any other link yt-dlp supports)
		disabledProviders: [],
		// Where plain-text searches play from: youtube, soundcloud or tidal (falls back to YouTube without a match)
		defaultSource: 'youtube',
		// Maximum number of tracks loaded from one playlist or album
		maxPlaylistSize: 100,
		// Save queues to MongoDB so playback carries on where it was after the bot restarts
		persistQueue: true,
		// Fixes YouTube's "Sign in to confirm you're not a bot" on server IPs. Only one is used, in this order.
		youtube: {
			// As CLIENT.CONTEXT+TOKEN (e.g. web.gvs+abc...), a bare token is treated as web.gvs
			poToken: '',
			// chrome, firefox, edge or safari
			cookiesFromBrowser: '',
			// Path to a Netscape cookies.txt export
			cookiesFile: '',
			// Force yt-dlp's YouTube client(s), e.g. 'web' or 'tv,web'. Leave empty for yt-dlp's defaults, which work best.
			playerClient: '',
		},
		// Optional self-hosted SongLink/Odesli-compatible API (e.g. 'https://example.com/v1') for matching Spotify,
		// Apple Music, Deezer and Tidal links exactly. Without it, Deezer and Apple Music links use their public APIs.
		// If you want to use a self-hosted SongLink API, you can deploy one from https://github.com/thororen1234/SongLinkAPI
		songlink: {
			apiUrl: '',
			apiKey: '',
		},
		// Needed for Spotify albums, playlists and artists (https://developer.spotify.com/dashboard)
		spotify: {
			clientId: '',
			clientSecret: '',
		},
		// Play from Tidal through a TidalSubsonic server (https://github.com/vMohammad24/TidalSubsonic)
		tidal: {
			url: '',
			username: '',
			password: '',
		},
		// Discord attachments played with `play <attachment>`
		uploads: {
			maxMegabytes: 25,
		},
		// Used by `play ftts://Your%20text` (https://flowery.pw/docs).
		floweryTts: {
			apiUrl: 'https://api.flowery.pw/v1/tts',
			voice: '',
			translate: false,
			silence: 0,
			speed: 1,
			audioFormat: 'mp3',
		},
		// Used by the `tts` command and `play speak:Your text`.
		speechTts: {
			language: 'en-AU',
		},
	},
	Staff: {
		ContributorRole: '814645275544387705',
		SupportRole: '740674583023321200',
		DeveloperRole: '740682780467396705',
	},
	// URL to mongodb
	MongoDBURl: 'mongodb://link',
	// embed colour
	embedColor: Colors.Default,
	// This will spam your console if you enable this but will help with bug fixing
	debug: false,
};

module.exports = config;
