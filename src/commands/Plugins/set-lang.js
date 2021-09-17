// Dependencies
const { MessageActionRow, MessageSelectMenu } = require('discord.js'),
	Command = require('../../structures/Command.js');


const flags = {
	'en-US': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
	'fr-FR': '🇫🇷',
	'ar-EG': '🇪🇬',
	'de-DE': '🇩🇪',
	'es-ES': '🇪🇸',
	'it-IT': '🇮🇹',
	'nl-NL': '🇳🇱',
	'pt-BR': '🇧🇷',
	'ru-RU': '🇷🇺',
};
/**
 * Set lang command
 * @extends {Command}
*/
class Setlang extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'set-lang',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setlanguage', 'setlang'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Choose the language for the bot.',
			usage: 'setlang <language>',
			cooldown: 5000,
			examples: ['setlang english'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// get language
		if (message.args[0]) {
			const language = bot.languages.find((l) => l.name === message.args[0] || l.aliases.includes(message.args[0]));
			if (!message.args[0] || !language) {
				return message.channel.error('plugins/set-lang:MISSING_LANG', { list: bot.languages.map((l) => '`' + l.name + '`').join(', ') });
			} else {
				await updateLanguage(message.guild, language);
			}
		} else {
			const options = bot.languages.map(lan => ({
				label: lan.nativeName,
				value: lan.name,
				description: `Update server's language to ${lan.nativeName}.`,
				emoji: { name: flags[lan.name] },
			}));
			const row = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('setlang')
						.setPlaceholder(bot.languages.find((lan) => lan.name == settings.Language).nativeName)
						.addOptions(options),
				);

			// send message
			message.channel.send({ content: 'Please select a language for this server', components: [row] }).then(async msg => {
				const filter = (interaction) => interaction.customId === 'setlang' && interaction.user.id === message.author.id;

				try {
					const resp = await msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 15000 });
					await updateLanguage(message.guild, bot.languages.find(l => l.name === resp.values[0]));
					msg.delete();
				} catch {
					msg.delete();
				}
			});
		}

		async function updateLanguage(guild, language) {
			try {
				await guild.updateGuild({ Language: language.name });
				return message.channel.success('plugins/set-lang:SUCCESS', { NAME: language.nativeName });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		}
	}
}

module.exports = Setlang;
