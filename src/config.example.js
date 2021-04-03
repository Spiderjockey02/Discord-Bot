const config = {
	ownerID: ['YourAccountID'],
	token: 'YourBotToken',
	botClient: 'YourBotClientSecret',
	// For looking up Twitch, Fortnite, Steam accounts
	api_keys: {
		// https://dev.twitch.tv/console/apps
		twitch: {
			clientID: '',
			clientSecret: '',
		},
		// https://fortnitetracker.com/site-api
		fortnite: 'fortniteAPI-Key',
		// https://api.ksoft.si/
		ksoft: 'ksoftAPI-Key',
		// https://steamcommunity.com/dev
		steam: 'steamAPI-Key',
		// https://developer.spotify.com/documentation/web-api/
		spotify: {
			iD: 'spotify-ID',
			secret: 'spotify-secret',
		},
		// Your Ubisoft email and password (You don't need to enable anything)
		rainbow: {
			email: 'email',
			password: 'password',
		},
		// https://genius.com/developers
		genuis: 'genuisAPI-KEY',
		// https://api.amethyste.moe/
		amethyste: 'amethysteAPI-Key',
	},
	// add plugins/commands here if you don't want them loaded in the bot.
	disabledCommands: [],
	disabledPlugins: [],
	// This is a list of websites that the bot is on. API to interect with server/shard count
	DiscordBotLists: {
		// https://discord.boats/
		DiscordBoatAPI_Key: '',
		// https://arcane-center.xyz/
		ArcaneBotAPI_KEY: '',
		// https://botlist.space/
		botlist_spaceAPI_KEY: '',
	},
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
	},
	// This is just so some commands can be ran in DM channels
	defaultSettings: {
		// default settings
		prefix: 'e!',
		Language: 'en-US',
		plugins: ['Fun', 'Image', 'Misc', 'NSFW', 'Recording', 'Searcher'],
	},
	// Custom emojis, just for cosmetic (change these if you wish)
	emojis: {
		cross: ':negative_squared_cross_mark:',
		tick: ':white_check_mark:',
	},
	// URL to mongodb
	MongoDBURl: 'mongodb://link',
	// This will spam your console if you enable this but will help with bug fixing
	debug: false,
};

module.exports = config;
