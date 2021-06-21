// Dependencies
const { Collection } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class Interaction extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, interaction) {
		const guild = bot.guilds.cache.get(interaction.guildID),
			cmd = guild.interactions.get(interaction.commandName),
			channel = guild.channels.cache.get(interaction.channelID),
			member = guild.members.cache.get(interaction.user.id);

		// Make sure NSFW commands are only being run in a NSFW channel
		if (!channel.nsfw && cmd.conf.nsfw) {
			return bot.send(interaction, { embeds:[channel.error('events/message:NOT_NSFW_CHANNEL', {}, true)], ephemeral: true });
		}

		// check user permissions
		const neededPermissions = [];
		cmd.conf.userPermissions.forEach((perm) => {
			if (!channel.permissionsFor(member).has(perm)) neededPermissions.push(perm);
		});

		if (neededPermissions.length > 0) {
			return await bot.send(interaction, { embeds: [channel.error('misc:USER_PERMISSION', { PERMISSIONS: neededPermissions.map((p) => bot.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
		}

		// Check to see if user is in 'cooldown'
		if (!bot.cooldowns.has(cmd.help.name)) {
			bot.cooldowns.set(cmd.help.name, new Collection());
		}

		const now = Date.now(),
			timestamps = bot.cooldowns.get(cmd.help.name),
			cooldownAmount = (cmd.conf.cooldown || 3000);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return await bot.send(interaction, { embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		cmd.callback(bot, interaction, guild, interaction.options);
	}
};
