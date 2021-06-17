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
			Command = guild.interactions.get(interaction.commandName),
			channel = guild.channels.cache.get(interaction.channelID),
			member = guild.members.cache.get(interaction.user.id);

		// check user permissions
		const neededPermissions = [];
		Command.conf.userPermissions.forEach((perm) => {
			if (!channel.permissionsFor(member).has(perm)) neededPermissions.push(perm);
		});

		if (neededPermissions.length > 0) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:USER_PERMISSION', { PERMISSIONS: neededPermissions.map((p) => bot.translate(`permissions:${p}`)).join(', ') }, true)] });
		}

		// Check to see if user is in 'cooldown'
		if (!bot.cooldowns.has(Command.help.name)) {
			bot.cooldowns.set(Command.help.name, new Collection());
		}

		const now = Date.now(),
			timestamps = bot.cooldowns.get(Command.help.name),
			cooldownAmount = (Command.conf.cooldown || 3000);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				console.log(channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true));
				return interaction.reply({ ephemeral: true, embeds: [channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)] });
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		return Command.callback(bot, interaction, guild, interaction.options);
	}
};
