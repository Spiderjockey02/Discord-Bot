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
	// Information for the Bot's dashboard
	Dashboard: {
		// If the dashboard should be enabled or not
		enabled : true,
		// For security
		sessionSecret: 'SpamYourKeyboardHere',
		// Your IP add this to your OAuth2 redirect list found on (https://discord.com/developers/applications)
		domain: 'YourIP',
		legalTemplates: {
			// This email will be used in the legal page of the dashboard if someone needs to contact you for any reason regarding this page
			contactEmail: 'YourEmailAddress@something.com',
			// Change this if you update the `TERMS.md` or `PRIVACY.md` files in `dashboard/public/`
			lastEdited: '13 August 2020',
		},
		// Version that the bot is running at
		version: '0.9 BETA',
	},
	// Link to your support server
	SupportLink: 'LinkToYourSupportServer',
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
};
module.exports = config;
