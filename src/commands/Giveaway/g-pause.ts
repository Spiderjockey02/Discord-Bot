import { ApplicationCommandOptionType, Message, PermissionFlagsBits } from 'discord.js';
import Command from '../../structures/Command';
import EgglordClient from 'src/base/Egglord';
import { Setting } from '@prisma/client';

/**
 * Giveaway pause command
 * @extends {Command}
*/
export default class GiveawayPause extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor() {
		super({
			name: 'g-pause',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-pause', 'gpause'],
			userPermissions: [Flags.ManageGuild],
			description: 'Pause a giveaway',
			usage: 'g-pause <messageID>',
			cooldown: 2000,
			examples: ['g-pause 818821436255895612'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'id',
					description: 'Message ID of the giveaway.',
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(client: EgglordClient, message: Message, settings: Setting) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure the message ID of the giveaway embed is entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-pause:USAGE')) });

		// Pause the giveaway
		const messageID = message.args[0];
		try {
			await client.giveawayManager.pause(messageID);
			message.channel.send(client.translate('giveaway/g-pause:SUCCESS_GIVEAWAY'));
		} catch (err) {
			client.logger.error(`Command: 'g-delete' has error: ${err}.`);
			message.channel.send(client.translate('giveaway/g-pause:UNKNOWN_GIVEAWAY', { ID: messageID }));
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
		const channel = guild.channels.cache.get(interaction.channelId),
			messageID = args.get('id').value;

		// Pause the giveaway
		try {
			await client.giveawaysManager.pause(messageID);
			interaction.reply({ embeds: [channel.success('giveaway/g-pause:SUCCESS_GIVEAWAY', {}, true)] });
		} catch (err) {
			client.logger.error(`Command: 'g-delete' has error: ${err}.`);
			interaction.reply({ content: client.translate('giveaway/g-pause:UNKNOWN_GIVEAWAY', { ID: messageID }), ephemeral: true });
		}
	}
}