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
	async run(bot, message) {
		message.channel.send(`=-=-=-=-=-=-=- Loading interactions for ${bot.guilds.cache.size} guilds -=-=-=-=-=-=-=`);
		let successCount = 0;
		// loop through each guild
		for (const guild of [...bot.guilds.cache.values()]) {
			const enabledPlugins = guild.settings.plugins;
			const data = [];

			// get slash commands for category
			for (const plugin of enabledPlugins) {
				const g = await bot.loadInteractionGroup(plugin, guild);
				if (Array.isArray(g)) data.push(...g);

			}

			// For the "Host" commands
			if (guild.id == bot.config.SupportServer.GuildID) {
				const cmds = await bot.loadInteractionGroup('Host', guild);
				for (const cmd of cmds) {
					cmd.defaultMemberPermissions = [Flags.Administrator];
				}
				if (Array.isArray(cmds)) data.push(...cmds);
			}

			// get context menus
			data.push({ name: 'Add to Queue', type: ApplicationCommandType.Message },
				{ name: 'Translate', type: ApplicationCommandType.Message },
				{ name: 'OCR', type: ApplicationCommandType.Message },
				{ name: 'Avatar', type: ApplicationCommandType.User },
				{ name: 'Userinfo', type: ApplicationCommandType.User },
				{ name: 'Screenshot', type: ApplicationCommandType.Message },
			);
			try {
				await bot.guilds.cache.get(guild.id)?.commands.set(data);
				bot.logger.log('Loaded interactions for guild: ' + guild.name);
				successCount++;
			} catch (err) {
				bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
			}

		}
		message.channel.send(`Successfully updated ${successCount}/${bot.guilds.cache.size} servers' interactions.`);
	}
}

module.exports = Docs;
