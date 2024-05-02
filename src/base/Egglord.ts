import { ActivityType, Client, GatewayIntentBits as FLAGS, Partials } from 'discord.js';
import Logger from '../utils/Logger';
import CommandManager from './CommandManager';
import config from '../config';
import AudioManager from './Audio-Manager';
import { DatabaseHandler } from '../accessors/client';
import LanguageManager from '../helpers/LanguageManager';
import customEmojis from '../assets/json/emojis.json';
import WebhookManager from './WebhookManager';

/**
 * Egglord custom client
 * @extends {Client}
*/
export default class EgglordClient extends Client<true> {
	logger: Logger;
	commandManager: CommandManager;
	config: typeof config;
	audioManager?: AudioManager;
	databaseHandler: DatabaseHandler;
	languageManager: LanguageManager;
	customEmojis: typeof customEmojis;
	webhookManger: WebhookManager;
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
		this.logger = new Logger();

		this.customEmojis = customEmojis;

		this.webhookManger = new WebhookManager(this);

		this.languageManager = new LanguageManager();

		this.commandManager = new CommandManager();

		this.databaseHandler = new DatabaseHandler();
		/**
		 * The config file
		 * @type {object}
		*/
		this.config = config;
	}
}
