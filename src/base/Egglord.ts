import { Client, ClientOptions } from 'discord.js';
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
	audioManager: AudioManager;
	databaseHandler: DatabaseHandler;
	languageManager: LanguageManager;
	customEmojis: typeof customEmojis;
	webhookManger: WebhookManager;
	statistics: {
		messages: number
		commands: number
	};
	constructor(options: ClientOptions) {
		super(options);

		this.logger = new Logger();
		this.customEmojis = customEmojis;
		this.webhookManger = new WebhookManager(this);
		this.languageManager = new LanguageManager();
		this.commandManager = new CommandManager();
		this.databaseHandler = new DatabaseHandler();
		this.audioManager = new AudioManager(this);
		this.config = config;

		this.statistics = {
			messages: 0,
			commands: 0,
		};
	}
}
