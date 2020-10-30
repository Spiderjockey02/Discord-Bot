const config = {
	ownerID: 'YourAccountID',
	token: 'YourBotToken',
	botID: 'YourBotID',
	botClient: 'YourBotClientSecret',
	// For looking up Twitch, Fortnite, Steam accounts
	TwitchAPI: 'TwitchAPI-Key',
	fortniteAPI: 'fortniteAPI-Key',
	SteamAPI: 'SteamAPI-Key',
	// For searching up lyrics
	KSoftSiAPI: 'KSoftSiAPI-Key',
	// For playing youtube, soundcloud songs
	YoutubeAPI_Key: 'YoutubeAPI_Key',
	soundcloudAPI_Key: 'soundcloudAPI_Key',
	// This so you can interact with the Discord.Boats API (Discord bot list website)
	DiscordBoatAPI_Key: 'DiscordBoatAPI_Key',
	// SO you can use the generate command
	amethysteAPI_KEY: 'amethysteAPI_KEY',
	// so you can update the https://arcane-center.xyz/ bot stats
	ArcaneBotAPI_KEY: '',
	// so you can update the https://botlist.space/ bot stats
	botlist_spaceAPI_KEY: '',
	// For searching up Rainbow 6 Siege accounts
	Rainbow6Siege: {
		// username & password to your ubisoft account
		username: 'YourUsername',
		password: 'YourPassword',
	},
	// Information for the Bot's dashboard
	Dashboard: {
		// If the dashboard should be enabled or not
		enabled : true,
		// For security
		sessionSecret: 'SpamYourKeyboardHere',
		// can either be http or https
		Protocol: 'https',
		// Your IP add this to your OAuth2 redirect list found on (https://discord.com/developers/applications)
		domain: 'YourIP',
		legalTemplates: {
			// This email will be used in the legal page of the dashboard if someone needs to contact you for any reason regarding this page
			contactEmail: 'YourEmailAddress@something.com',
			// Change this if you update the `TERMS.md` or `PRIVACY.md` files in `dashboard/public/`
			lastEdited: '13 August 2020',
		},
		// Version that the bot is running at
		version: '1',
	},
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
	},
	// This is just so some commands can be ran in DM channels
	defaultSettings: {
		// default settings
		prefix: '!',
	},
	// Custom emojis, just for cosmetic (change these if you wish)
	emojis: {
		cross: ':negative_squared_cross_mark:',
		tick: ':white_check_mark:',
	},
	// URL to mongodb
	MongoDBURl: 'mongodb://link',
	// If the NSFW commands should be loaded
	NSFWBot: true,
	// If you want your bot to use different languages per a server.
	useCustomLanguage: true,
	DefaultLanguage: 'en-US.json',
	// if you want debugging turned on or not
	debug: false,
};
module.exports = config;
