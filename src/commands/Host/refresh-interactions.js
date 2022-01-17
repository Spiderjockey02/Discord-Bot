// Dependencies
const Command = require('../../structures/Command.js');

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
			name: 'refresh-interaction',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Update all the servers interaction',
			usage: 'refresh-interaction',
			cooldown: 3000,
			examples: ['refresh-interaction'],
		});
	}

	/**
	 * Function for recieving message.
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

			// get context menus
			data.push({ name: 'Add to Queue', type: 'MESSAGE' },
				{ name: 'Translate', type: 'MESSAGE' },
				{ name: 'OCR', type: 'MESSAGE' },
				{ name: 'Avatar', type: 'USER' },
				{ name: 'Userinfo', type: 'USER' });

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
