import { Event, ErrorEmbed } from '../../structures';
import { ChatInputCommandInteraction, GuildTextBasedChannel, PermissionFlagsBits, PermissionsBitField, ThreadChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Slash create event
 * @event Egglord#SlashCreate
 * @extends {Event}
*/
export default class SlashCreate extends Event {
	constructor() {
		super({
			name: 'slashCreate',
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {CommandInteraction} interaction The slash command used
	 * @readonly
	*/
	async run(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const guild = interaction.guild,
			channel = guild.channels.cache.get(interaction.channelId) as GuildTextBasedChannel;

		// Get the command
		const cmd = client.commandManager.commands.get(interaction.commandName);
		if (!cmd) {
			const embed = new ErrorEmbed(client, guild)
				.setMessage(`The command: ${interaction.commandName} is not valid.`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// Add to the command statistics
		client.statistics.commands++;

		// Make sure NSFW commands are only being run in a NSFW channel
		if (channel instanceof ThreadChannel || (!channel.nsfw && cmd.conf.nsfw)) {
			const embed = new ErrorEmbed(client, guild)
				.setMessage('events/message:NOT_NSFW_CHANNEL');
			return interaction.reply({ embeds:[embed], ephemeral: true });
		}

		// Check to ensure the bot has the correct permission(s) to run the task assigned to the command
		const neededPermissions = [];
		for (const perm of cmd.conf.botPermissions) {
			if ([PermissionFlagsBits.Speak, PermissionFlagsBits.Connect].includes(perm)) {
				if (!interaction.member.voice.channel) return;
				if (!interaction.member.voice.channel.permissionsFor(client.user)?.has(perm)) {
					neededPermissions.push(perm);
				}
			} else if (!channel.permissionsFor(client.user)?.has(perm)) {
				neededPermissions.push(perm);
			}
		}

		// Display to the user what permissions are missing which the bot needs
		if (neededPermissions.length > 0) {
			const perms = new PermissionsBitField();
			neededPermissions.forEach((item) => perms.add(BigInt(item)));
			client.logger.error(`Missing permission: \`${perms.toArray().join(', ')}\` in [${guild.id}].`);

			// Send the error embed message
			const permissions = perms.toArray().map((p) => client.languageManager.translate(interaction.guild, `permissions:${p}`)).join(', ');
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:MISSING_PERMISSION', { PERMISSIONS: permissions });
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// Check if user is in cooldown
		if (client.commandManager.cooldowns.has(interaction.user.id)) return;

		// Run slash command
		if (client.config.debug) client.logger.debug(`Interaction: ${interaction.commandName} was ran by ${interaction.user.displayName}.`);

		try {
			await cmd.callback(client, interaction);

			// Handle command cooldown
			client.commandManager.cooldowns.add(interaction.user.id);
			setTimeout(() => {
				client.commandManager.cooldowns.delete(interaction.user.id);
			}, interaction.user.isPremiumTo !== null ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);
			return true;
		} catch (err: any) {
			client.logger.error(err);
			console.log(err);
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed], ephemeral: true });

			return false;
		}
	}
}

