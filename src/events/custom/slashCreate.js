// Dependencies
const { Collection } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class slashCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, interaction) {
		const guild = bot.guilds.cache.get(interaction.guildId),
			cmd = bot.commands.get(interaction.commandName),
			channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id);

		// Check to see if the command is being run in a blacklisted channel
		if ((guild.settings.CommandChannelToggle) && (guild.settings.CommandChannels.includes(channel.id))) {
			return bot.send(interaction, { embeds: [channel.error('events/message:BLACKLISTED_CHANNEL', { USER: member.user.tag }, true)], ephermal: true });
		}

		// Make sure NSFW commands are only being run in a NSFW channel
		if (!channel.nsfw && cmd.conf.nsfw) {
			return bot.send(interaction, { embeds:[channel.error('events/message:NOT_NSFW_CHANNEL', {}, true)], ephemeral: true });
		}

		// Check for bot permissions
		let neededPermissions = [];
		cmd.conf.botPermissions.forEach((perm) => {
			if (['SPEAK', 'CONNECT'].includes(perm)) {
				if (!member.voice.channel) return;
				if (!member.voice.channel.permissionsFor(guild.me).has(perm)) {
					neededPermissions.push(perm);
				}
			} else if (!channel.permissionsFor(guild.me).has(perm)) {
				neededPermissions.push(perm);
			}
		});

		// Display missing bot permissions
		if (neededPermissions.length > 0) {
			bot.logger.error(`Missing permission: \`${neededPermissions.join(', ')}\` in [${guild.id}].`);
			return bot.send(interaction, { embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: neededPermissions.map((p) => bot.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}

		// Check for user permissions
		neededPermissions = [];
		cmd.conf.userPermissions.forEach((perm) => {
			if (!channel.permissionsFor(member).has(perm)) neededPermissions.push(perm);
		});

		// Display missing user permissions
		if (neededPermissions.length > 0) {
			return bot.send(interaction, { embeds: [channel.error('misc:USER_PERMISSION', { PERMISSIONS: neededPermissions.map((p) => bot.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}

		// Check to see if user is in 'cooldown'
		if (!bot.cooldowns.has(cmd.help.name)) {
			bot.cooldowns.set(cmd.help.name, new Collection());
		}

		const now = Date.now(),
			timestamps = bot.cooldowns.get(cmd.help.name),
			cooldownAmount = (member.user.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return bot.send(interaction, { embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		return cmd.callback(bot, interaction, guild, interaction.options);
	}
};
