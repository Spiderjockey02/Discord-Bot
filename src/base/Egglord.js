// Dependencies
const { ActivityType, Client, Collection, GatewayIntentBits: FLAGS, Partials, PermissionsBitField: { Flags: PermissionFlag } } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	GiveawaysManager = require('./Giveaway-Manager'),
	path = require('path'),
	{ promisify } = require('util'),
	AudioManager = require('./Audio-Manager'),
	{ get } = require('axios'),
	readdir = promisify(require('fs').readdir);

/**
 * Egglord custom client
 * @extends {Client}
*/

class Egglord extends Client {
	constructor() {
		super({
			partials: [Partials.GuildMember, Partials.User, Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildScheduledEvent],
			intents: [FLAGS.AutoModerationConfiguration, FLAGS.AutoModerationExecution, FLAGS.Guilds, FLAGS.GuildMembers, FLAGS.GuildBans, FLAGS.GuildEmojisAndStickers,
				FLAGS.GuildMessages, FLAGS.GuildMessageReactions, FLAGS.DirectMessages, FLAGS.GuildVoiceStates, FLAGS.GuildInvites,
				FLAGS.GuildScheduledEvents, FLAGS.MessageContent, FLAGS.GuildModeration],
			presence: {
				status: 'online',
				activities: [{
					name: 'my mention',
					type: ActivityType.Listening,
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
			forceUpdateEvery: 15000,
			// giveaways are deleted 1 week after end
			endedGiveawaysLifetime: 604800000,
			default: {
				embedColor: '#FF0000',
				reaction: '🎉',
				lastChance: {
					enabled: true,
					content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
					threshold: 5000,
					embedColor: '#FF0000',
				},
				pauseOptions: {
					isPaused: false,
					content: '⚠️ **THIS GIVEAWAY IS PAUSED !** ⚠️',
					embedColor: '#FFFF00',
					infiniteDurationText: '`Never`',
				},
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
		this.subCommands = new Collection();
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
	 * Function for fetching slash command data.
	 * @param {string} category The command category to get data from
	 * @returns {array}
	*/
	async loadInteractionGroup(category) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
			const arr = [];
			for (const cmd of commands) {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						const item = {
							name: command.help.name,
							description: command.help.description,
							nsfw: command.conf.nsfw,
							defaultMemberPermissions: command.conf.userPermissions.length >= 1 ? command.conf.userPermissions : PermissionFlag.SendMessages,
						};
						if (command.conf.options[0]) item.options = command.conf.options;
						arr.push(item);
					}
				}
			}
			return arr;
		} catch (err) {
			console.log(err);
			return `Unable to load category ${category}: ${err}`;
		}
	}

	/**
	 * Function for deleting slash command category from guild.
	 * @param {string} category The command category to get data from
	 * @param {guild} guild The guild to delete the slash commands from
	 * @returns {?array}
	*/
	async deleteInteractionGroup(category) {
		try {
			const commands = (await readdir('./src/commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);

			const arr = [];
			for (const cmd of commands) {
				if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
					const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
					if (command.conf.slash) {
						arr.push({
							name: command.help.name,
							description: command.help.description,
							options: command.conf.options,
							defaultPermission: command.conf.defaultPermission,
						});
					}
				}
			}
			return arr;
		} catch (err) {
			return `Unable to load category ${category}: ${err}`;
		}
	}

	/**
	 * Function adult sites for blocking on non-nsfw channels.
	 * @return {array}
	*/
	async fetchAdultSiteList() {
		this.adultSiteList = require('../assets/json/whitelistWebsiteList.json').websites;
		// this.adultSiteList = blockedWebsites.websites;
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
		this.embedCollection.set(channelID, [this.embedCollection.has(channelID) ? [...this.embedCollection.get(channelID), embed].flat() : embed]);
	}

	/**
	 * Function for adding embeds to the webhook manager. (Stops API abuse)
	 * @param {string} endpoint The key to search up
	 * @readonly
	*/
	async fetch(endpoint, query = {}) {
		try {
			if (endpoint.startsWith('image') || endpoint == 'misc/qrcode') {
				const { data } = await get(`https://api.egglord.dev/api/${endpoint}?${new URLSearchParams(query)}`, {
					headers: { 'Authorization': this.config.api_keys.masterToken },
					responseType: 'arraybuffer',
				});
				return data;
			} else {
				const { data } = await get(`https://api.egglord.dev/api/${endpoint}?${new URLSearchParams(query)}`, {
					headers: { 'Authorization': this.config.api_keys.masterToken },
				});

				// Check if error or not
				if (data.error) {
					return { error: data.error };
				} else {
					return data.data;
				}

			}
		} catch (err) {
			const error = err.response?.data.error ?? 'API website currently down';
			this.logger.error(error);
			return { error: error };
		}
	}
}

module.exports = Egglord;
