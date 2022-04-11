// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Unlock command
 * @extends {Command}
*/
class Unlock extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'unlock',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'unlock a channel',
			usage: 'unlock [channel]',
			cooldown: 5000,
			examples: ['unlock @channel'],
			slash: false,
			options: [
				{
					name: 'user',
					description: 'The channel to lock.',
					type: 'CHANNEL',
					channelTypes: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD', 'GUILD_NEWS'],
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Get channel and update permissions
		const channel = message.getChannel()[0];
		try {
			await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
				SEND_MESSAGES: true,
			});
			for (const role of (settings.welcomeRoleGive ?? [])) {
				await channel.permissionOverwrites.edit(role, {
					SEND_MESSAGES: true,
				});
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(args.get('channel').value),
			{ settings } = guild;

		// Get channel and update permissions
		try {
			await channel.permissionOverwrites.edit(guild.roles.everyone, {
				SEND_MESSAGES: true,
			});
			for (const role of (settings.welcomeRoleGive ?? [])) {
				await channel.permissionOverwrites.edit(role, {
					SEND_MESSAGES: true,
				});
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Unlock;
