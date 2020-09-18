var config = {
	ownerID : 'YourAccountID',
	token : 'YourBotToken',
	prefix : '!',
	TwitchAPI: 'TwitchAPI-Key',
	fortniteAPI: 'fortniteAPI-Key',
	KSoftSiAPI: 'KSoftSiAPI-Key',
	SteamAPI: 'SteamAPI-Key',
	YoutubeAPI_Key: 'YoutubeAPI_Key',
	soundcloudAPI_Key: 'soundcloudAPI_Key',
	SpotifyAPI_Key: 'SpotifyAPI_Key',
	DiscordBoatAPI_Key: 'DiscordBoatAPI_Key',
	Dashboard: {
		enabled : true,
		sessionSecret: 'SpamYourKeyboardHere',
		domain: 'YourIP',
		legalTemplates: {
			contactEmail: 'YourEmailAddress', // This email will be used in the legal page of the dashboard if someone needs to contact you for any reason regarding this page
			lastEdited: '13 August 2020' // Change this if you update the `TERMS.md` or `PRIVACY.md` files in `dashboard/public/`
		}
	},
	SupportLink: 'LinkToYourSupportServer',
	defaultSettings: {
		//default settings
		prefix: '!'
	},
	emojis: {
		cross: 'CrossEmoji',
		tick: 'TickEmoji',
	}
}
module.exports = config;
