const config = {
	ownerID: 'YourAccountID',
	token: 'YourBotToken',
	botClient: 'YourBotClientSecret',
	// For looking up Twitch, Fortnite, Steam accounts
	api_keys: {
		twitch: 'twitchAPI-Key',
		fortnite: 'fortniteAPI-Key',
		ksoft: 'ksoftAPI-Key',
		steam: 'steamAPI-Key',
		youtube: 'youtubeAPI-Key',
		soundcloud: 'soundcloudAPI-Key',
		amethyste: 'amethysteAPI-Key',
	},
	// IF you want any commands/plugins disabled
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
		Language: 'en-US',
	},
	// Custom emojis, just for cosmetic (change these if you wish)
	emojis: {
		cross: ':negative_squared_cross_mark:',
		tick: ':white_check_mark:',
	},
	// URL to mongodb
	MongoDBURl: 'mongodb://link',
	// if you want debugging turned on or not
	debug: false,
};
module.exports = config;
