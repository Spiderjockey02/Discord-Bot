import { Event } from '../../structures';
import { Collection, CommandInteraction, PermissionFlagsBits } from 'discord.js';
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
	async run(client: EgglordClient, interaction: CommandInteraction) {
		const guild = client.guilds.cache.get(interaction.guildId),
			cmd = client.commands.get(interaction.commandName),
			channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id);

		// Check to see if the command is being run in a blacklisted channel
		if ((guild.settings.CommandChannelToggle) && (guild.settings.CommandChannels.includes(channel.id))) {
			return interaction.reply({ embeds: [channel.error('events/message:BLACKLISTED_CHANNEL', { USER: member.user.displayName }, true)], ephermal: true });
		}

		// Make sure NSFW commands are only being run in a NSFW channel
		if (!channel.nsfw && cmd.conf.nsfw) {
			return interaction.reply({ embeds:[channel.error('events/message:NOT_NSFW_CHANNEL', {}, true)], ephemeral: true });
		}

		// Check for client permissions
		let neededPermissions = [];
		cmd.conf.botPermissions.forEach((perm) => {
			if ([PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect].includes(perm)) {
				if (!member.voice.channel) return;
				if (!member.voice.channel.permissionsFor(client.user).has(perm)) {
					neededPermissions.push(perm);
				}
			} else if (!channel.permissionsFor(client.user)?.has(perm)) {
				neededPermissions.push(perm);
			}
		});

		// Display missing client permissions
		if (neededPermissions.length > 0) {
			const perms = new PermissionsBitField();
			neededPermissions.forEach((item) => perms.add(BigInt(item)));
			client.logger.error(`Missing permission: \`${perms.toArray().join(', ')}\` in [${guild.id}].`);
			return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => client.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}
		// Check for user permissions
		neededPermissions = [];
		cmd.conf.userPermissions.forEach((perm) => {
			if (!channel.permissionsFor(member).has(perm)) neededPermissions.push(perm);
		});

		// Display missing user permissions
		if (neededPermissions.length > 0) {
			const perms = new PermissionsBitField();
			neededPermissions.forEach((item) => perms.add(BigInt(item)));
			return interaction.reply({ embeds: [channel.error('misc:USER_PERMISSION', { PERMISSIONS: perms.toArray().map((p) => client.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}

		// Make sure user does not have access to ownerOnly commands
		if (cmd.conf.ownerOnly && !client.config.ownerID.includes(interaction.user.id)) {
			return interaction.reply({ content: 'Nice try', ephemeral: true });
		}

		// Check to see if user is in 'cooldown'
		if (!client.cooldowns.has(cmd.help.name)) {
			client.cooldowns.set(cmd.help.name, new Collection());
		}

		const now = Date.now(),
			timestamps = client.cooldowns.get(cmd.help.name),
			cooldownAmount = (member.user.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interaction.reply({ embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		// Run slash command
		if (client.config.debug) client.logger.debug(`Interaction: ${interaction.commandName} was ran by ${interaction.user.displayName}.`);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		await cmd.callback(client, interaction, guild, interaction.options);
		timestamps.set(interaction.user.id, now);
		client.commandsUsed++;
	}
}

