// Dependencies
const { MessageEmbed } = require('discord.js');

// When the bot joins a server
module.exports = async (bot, guild) => {
	// LOG server Join
	bot.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot.`);

	// Apply server settings
	try {
		const newGuild = {
			guildID: guild.id,
			guildName: guild.name,
		};
		await bot.CreateGuild(newGuild);
	} catch (e) {
		console.error(e);
	}
	await guild.fetchGuildConfig();

	// Send message to channel that bot has joined a server
	const embed = new MessageEmbed()
		.setTitle(`[GUILD JOIN] ${guild.name}`)
		.setImage(guild.iconURL({ dynamic: true, size: 1024 }))
		.setDescription(`Guild ID: ${guild.id}\nOwner: ${guild.owner.user.tag}\nMemberCount: ${guild.memberCount}`);
	const channel = bot.channels.cache.get(bot.config.SupportServer.GuildChannel);
	if (channel) channel.send(embed);
};
