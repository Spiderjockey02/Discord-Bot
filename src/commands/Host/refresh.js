// Dependencies
const { ApplicationCommandType } = require('discord-api-types/v10'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Docs command
 * @extends {Command}
*/
class Docs extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'refresh',
			ownerOnly: true,
			dirname: __dirname,
			aliases: ['refresh-interaction'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Update all the servers interaction',
			usage: 'refresh-interaction',
			cooldown: 3000,
			examples: ['refresh-interaction'],
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message, settings) {
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/refresh:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		switch (message.args[0]) {
			case 'interactions': {
				message.channel.send(`=-=-=-=-=-=-=- Loading interactions for ${bot.guilds.cache.size} guilds -=-=-=-=-=-=-=`);
				let successCount = 0;
				// loop through each guild
				for (const guild of [...bot.guilds.cache.values()]) {
					const enabledPlugins = guild.settings.plugins;
					const cmdsToUpload = [];

					// get slash commands for category
					for (const plugin of enabledPlugins) {
						const g = await bot.loadInteractionGroup(plugin, guild);
						if (Array.isArray(g)) cmdsToUpload.push(...g);

					}

					// For the "Host" commands
					if (guild.id == bot.config.SupportServer.GuildID) {
						const cmds = await bot.loadInteractionGroup('Host', guild);
						for (const cmd of cmds) {
							cmd.defaultMemberPermissions = [Flags.Administrator];
						}
						if (Array.isArray(cmds)) cmdsToUpload.push(...cmds);
					}

					// get context menus
					try {
						await bot.guilds.cache.get(guild.id)?.commands.set(cmdsToUpload);
						bot.logger.log('Loaded interactions for guild: ' + guild.name);
						successCount++;
					} catch (err) {
						bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
					}
				}
				bot.application.commands.set([{ name: 'Add to Queue', type: ApplicationCommandType.Message },
					{ name: 'Translate', type: ApplicationCommandType.Message },
					{ name: 'OCR', type: ApplicationCommandType.Message },
					{ name: 'Avatar', type: ApplicationCommandType.User },
					{ name: 'Userinfo', type: ApplicationCommandType.User },
					{ name: 'Screenshot', type: ApplicationCommandType.Message },
				]);

				message.channel.send(`Successfully updated ${successCount}/${bot.guilds.cache.size} servers' interactions.`);
				break;
			}
			case 'language':
				bot.translations = await require('../../helpers/LanguageManager')();
				break;
			default:

		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
}

module.exports = Docs;
