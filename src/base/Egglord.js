// Dependencies
const { Client, Collection } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	GiveawaysManager = require('./giveaway/Manager'),
	path = require('path'),
	{ promisify } = require('util'),
	AudioManager = require('./Audio-Manager'),
	Reddit = require('../APIs/reddit.js'),
	readdir = promisify(require('fs').readdir);

/**
 * Egglord custom client
 * @extends {Client}
*/
class Egglord extends Client {
	constructor() {
		super({
			partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_SCHEDULED_EVENT'],
			intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGES',
				'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_INVITES', 'GUILD_SCHEDULED_EVENTS'],
			presence: {
				status: 'online',
				activities: [{
					name: 'my mention',
					type: 'LISTENING',
					url: 'https://www.twitch.tv/ram5s5',
				}],
			},
		});

		/**
 		 * The logger file
 	 	 * @type {function}
 	  */
		this.logger = require('../utils/Logger');

		/**
		 * The Giveaway manager
		 * @type {GiveawaysManager}
		*/
		this.giveawaysManager = new GiveawaysManager(this, {
			storage: false,
			updateCountdownEvery: 10000,
			// giveaways are deleted 1 week after end
			endedGiveawaysLifetime: 604800000,
			default: {
				botsCanWin: false,
				exemptPermissions: [],
				embedColor: '#FF0000',
				reaction: '🎉',
			},
		});

		/**
		 * The command data
		 * @type {Collection}
		 * @type {Collection}
		 * @type {Collection}
		 * @type {Collection}
		*/
		this.aliases = new Collection();
		this.commands = new Collection();
		this.interactions = new Collection();
		this.cooldowns = new Collection();
		this.requests = {};
		/**
		 * ALlows connection to database
		 * @type {function}
		*/
		this.mongoose = require('../database/mongoose');

		/**
		 * The config file
		 * @type {object}
		*/
		this.config = require('../config.js');

		/**
		 * The activity for the bot
		 * @type {array}
		 * @type {string}
		*/
		this.Activity = [];
		this.PresenceType = 'PLAYING';

		/**
		 * Basic statistics for the bot
		 * @type {number}
		 * @type {number}
		*/
		this.messagesSent = 0;
		this.commandsUsed = 0;

		/**
		 * The array of adult sites for blocking on non-nsfw channels.
		 * @type {array}
		*/
		this.adultSiteList = [];

		/**
		 * The collection of embeds for the webhook manager. (Stops API abuse)
		 * @type {Collection}
		 * @external Collection
		*/
		this.embedCollection = new Collection();

		/**
		 * The custom emojis the bot uses.
		 * @type {object}
		*/
		this.customEmojis = require('../assets/json/emojis.json');

		/**
		 * The langauges the bot supports.
		 * @type {object}
		*/
		this.languages = require('../languages/language-meta.json');

		/**
		 * Function for waiting. (acts like a pause)
		 * @param {number} ms How long to wait
		 * @type {function}
		*/
		this.delay = ms => new Promise(res => setTimeout(res, ms));

		/**
		 * The Audio manager
		 * @type {Class}
		*/
		this.manager = new AudioManager(this);

		this.reddit = new Reddit();
	}

	/**
	 * Function for deleting guilds settings from database.
	 * @param {guild} guild The guild that kicked the bot
	 * @returns {boolean}
	*/
	async DeleteGuild(guild) {
		try {
			await GuildSchema.findOneAndRemove({ guildID: guild.id });
			return true;
		} catch (err) {
			if (this.config.debug) this.logger.debug(err.message);
			return false;
		}
	}

	/**
	 * Function for deleting guilds settings from database.
	 * @param {string} type The type of activity: PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM or COMPETING.
	 * @param {?array} Activities The guild that kicked the bot
	 * @readonly
	*/
	SetActivity(type, array = []) {
		this.Activity = array;
		this.PresenceType = type;
		try {
			let j = 0;
			setInterval(() => this.user.setActivity(`${this.Activity[j++ % this.Activity.length]}`, { type: type, url: 'https://www.twitch.tv/ram5s5' }), 10000);
		} catch (e) {
			console.log(e);
		}
	}

	/**
	 * Function for loading commands to the bot.
	 * @param {string} commandPath The path of where the command is located
	 * @param {string} commandName The name of the command
	 * @readonly
	*/
	loadCommand(commandPath, commandName) {
		const cmd = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
		this.logger.log(`Loading Command: ${cmd.help.name}.`);
		cmd.conf.location = commandPath;
		this.commands.set(cmd.help.name, cmd);
		cmd.help.aliases.forEach((alias) => {
			this.aliases.set(alias, cmd.help.name);
		});
	}

	/**
	 * Function for fetching slash command data.
	 * @param {string} category The command category to get data from
	 * @returns {?array}
	*/
	async loadInteractionGroup(category) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			commands.forEach((cmd) => {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						const item = {
							name: command.help.name,
							description: command.help.description,
							defaultPermission: command.conf.defaultPermission,
						};
						if (command.conf.options[0]) {
							item.options = command.conf.options;
						}
						arr.push(item);
					}
				}
			});
			return arr;
		} catch (err) {
			return `Unable to load category ${category}: ${err}`;
		}
	}

	/**
	 * Function for deleting slash command category from guild.
	 * @param {string} category The command category to get data from
	 * @param {guild} guild The guild to delete the slash commands from
	 * @returns {?array}
	*/
	async deleteInteractionGroup(category, guild) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			commands.forEach((cmd) => {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						arr.push({
							name: command.help.name,
							description: command.help.description,
							options: command.conf.options,
							defaultPermission: command.conf.defaultPermission,
						});
						guild.interactions.delete(command.help.name, command);
					}
				}
			});
			return arr;
		} catch (err) {
			return `Unable to load category ${category}: ${err}`;
		}
	}

	/**
	 * Function for unloading commands to the bot.
	 * @param {string} commandPath The path of where the command is located
	 * @param {string} commandName The name of the command
	 * @readonly
	*/
	async unloadCommand(commandPath, commandName) {
		let command;
		if (this.commands.has(commandName)) {
			command = this.commands.get(commandName);
		} else if (this.aliases.has(commandName)) {
			command = this.commands.get(this.aliases.get(commandName));
		}
		if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
	}

	/**
	 * Function adult sites for blocking on non-nsfw channels.
	 * @return {array}
	*/
	async fetchAdultSiteList() {
		const blockedWebsites = require('../assets/json/whitelistWebsiteList.json');
		this.adultSiteList = blockedWebsites.websites;
		return this.adultSiteList;
	}

	/**
	 * Function for getting translations.
	 * @param {string} key The key to search up
	 * @param {object} args The args for variables in the key
	 * @param {string} locale The langauge to translate to
	 * @return {string}
	*/
	translate(key, args, locale) {
		if (!locale) locale = require('../assets/json/defaultGuildSettings.json').Language;
		const language = this.translations.get(locale);
		if (!language) return 'Invalid language set in data.';
		return language(key, args);
	}

	/**
	 * Function for adding embeds to the webhook manager. (Stops API abuse)
	 * @param {string} channelID The key to search up
	 * @param {embed} embed The args for variables in the key
	 * @readonly
	*/
	addEmbed(channelID, embed) {
		// collect embeds
		if (!this.embedCollection.has(channelID)) {
			this.embedCollection.set(channelID, [embed]);
		} else {
			this.embedCollection.set(channelID, [...this.embedCollection.get(channelID), embed]);
		}
	}
}

module.exports = Egglord;
