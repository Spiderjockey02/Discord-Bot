// Dependencies
const { ApplicationCommandOptionType, MessageActionRow, MessageSelectMenu, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';


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
export default class Setlang extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'settings-lang',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setlanguage', 'setlang'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Choose the language for the client.',
			usage: 'setlang <language>',
			cooldown: 5000,
			examples: ['setlang english'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'language',
					description: 'Set the language for the server',
					type: ApplicationCommandOptionType.String,
					choices: client.languages.map(lan => lan.nativeName).map(i => ({ name: i, value: i })),
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(client, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// get language
		if (message.args[0]) {
			const language = client.languages.find((l) => l.name === message.args[0] || l.aliases.includes(message.args[0]));
			if (!message.args[0] || !language) {
				return message.channel.error('plugins/set-lang:MISSING_LANG', { list: client.languages.map((l) => '`' + l.name + '`').join(', ') });
			} else {
				const embed = await this.updateLanguage(client, message.channel, language);
				message.channel.send({ embeds: [embed] });
			}
		} else {
			const options = client.languages.map(lan => ({
				label: lan.nativeName,
				value: lan.name,
				description: `Update server's language to ${lan.nativeName}.`,
				emoji: { name: flags[lan.name] },
			}));
			const row = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('setlang')
						.setPlaceholder(client.languages.find((lan) => lan.name == settings.Language).nativeName)
						.addOptions(options),
				);

			// send message
			message.channel.send({ content: 'Please select a language for this server', components: [row] }).then(async msg => {
				const filter = (interaction) => interaction.customId === 'setlang' && interaction.user.id === message.author.id;

				try {
					const resp = await msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 15000 });
					const embed = await this.updateLanguage(client, message.channel, client.languages.find(l => l.name === resp.values[0]));
					message.channel.send({ embeds: [embed] });
					msg.delete();
				} catch {
					msg.delete();
				}
			});
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const language = args.get('language').value,
			channel = guild.channels.cache.get(interaction.channelId);

		try {
			const embed = await this.updateLanguage(client, channel, client.languages.find(l => l.nativeName == language));
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	async updateLanguage(client, channel, language) {
		try {
			await channel.guild.updateGuild({ Language: language.name });
			return channel.success('plugins/set-lang:SUCCESS', { NAME: language.nativeName }, true);
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

