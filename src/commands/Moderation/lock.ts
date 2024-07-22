// Dependencies
const { ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'), ;
import Command from '../../structures/Command';

/**
 * Lock command
 * @extends {Command}
*/
export default class Lock extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'lock',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lockdown'],
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Lockdown a channel',
			usage: 'lock [channel]',
			cooldown: 5000,
			examples: ['lock @channel'],
			slash: false,
			options: [
				{
					name: 'channel',
					description: 'The channel to lock.',
					type: ApplicationCommandOptionType.Channel,
					channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.PrivateThread, ChannelType.GuildNews],
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
	async run(client, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Get channel and update permissions
		const channel = message.getChannel()[0];
		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				SendMessages: false,
			});
			for (const role of (settings.welcomeRoleGive ?? [])) {
				await channel.permissionOverwrites.edit(role, {
					SendMessages: false,
				});
			}
		} catch (err) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
		const channel = guild.channels.cache.get(args.get('channel').value);

		// Get channel and update permissions
		try {
			await channel.permissionOverwrites.edit(guild.roles.everyone, {
				SendMessages: false,
			});
			for (const role of (guild.settings.welcomeRoleGive ?? [])) {
				await channel.permissionOverwrites.edit(role, {
					SendMessages: false,
				});
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}
