// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Guildicon extends Command {
	constructor(bot) {
		super(bot, {
			name:  'guildicon',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['servericon'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get the server\'s icon.',
			usage: 'guildicon',
			cooldown: 2000,
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// Check for guild icon & send message
		if (message.guild.icon) {
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('guild/guildicon:ICON', { URL: message.guild.iconURL({ dynamic: true, size: 1024 }) }))
				.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
			message.channel.send({ embeds: [embed] });
		} else {
			if (message.deletable) message.delete();
			message.channel.error('guild/guildicon:NO_GUILD_ICON').then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelID);
		// Check for guild icon & send message
		if (guild.icon) {
			const embed = new Embed(bot, guild)
				.setDescription(bot.translate('guild/guildicon:ICON', { URL: guild.iconURL({ dynamic: true, size: 1024 }) }))
				.setImage(guild.iconURL({ dynamic: true, size: 1024 }));
			bot.send(interaction, { embeds: [embed] });
		} else {
			// return interaction.reply({ ephemeral: true, embeds: [channel.error('guild/guildicon:NO_GUILD_ICON', { ERROR: null }, true)] });
			bot.send(interaction, { embeds: [channel.error('guild/guildicon:NO_GUILD_ICON', { }, true)], ephemeral: true });
			// return bot.send(interaction, [channel.error('guild/guildicon:NO_GUILD_ICON', { ERROR: null }, true)], true);
		}
	}
};
