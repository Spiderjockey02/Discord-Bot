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
	Staff: {
		OwnerRole: "177566090686103552",
		DiscordManagerRole: "432034666833510400",
		CommunityManagerRole: "922941676274720789",
		AdministratorRole: "922983138467123200",
		ModeratorRole: "922941664677486642",
		TrialModeratorRole:"1075589258959667322",
		DeveloperRole: "922983778677301259",
		LegendsRole: "1037545381044703295",
	},
	LavalinkNodes: [
		{ host: 'localhost', port: 5000, password: 'youshallnotpass' },
	],
	// URL to mongodb
	MongoDBURl: 'mongodb://link',
	// embed colour
	embedColor: Colors.Default,
	// This will spam your console if you enable this but will help with bug fixing
	debug: false,
};

module.exports = config;
