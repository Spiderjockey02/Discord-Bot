// Dependencies
const { MessageEmbed } = require('discord.js');

function sendMessage(newRole, settings, embed) {
	const modChannel = newRole.guild.channels.cache.get(settings.ModLogChannel);
	if (modChannel) modChannel.send(embed);
}

module.exports = async (bot, oldRole, newRole) => {
	// Get server settings
	const settings = newRole.guild.settings;

	// Check if event roleUpdate is for logging
	if (settings.ModLogEvents.includes('ROLEUPDATE') && settings.ModLog) {

		// role name change
		if (oldRole.name != newRole.name) {
			const embed = new MessageEmbed()
				.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
				.setColor(15105570)
				.setFooter(`ID: ${newRole.id}`)
				.setAuthor(newRole.guild.name, newRole.guild.iconURL())
				.addField('Before:', oldRole.name)
				.addField('After:', newRole.name)
				.setTimestamp();
			sendMessage(newRole, settings, embed);
		}

		// role colour change
		if (oldRole.color != newRole.color) {
			const embed = new MessageEmbed()
				.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
				.setColor(15105570)
				.setFooter(`ID: ${newRole.id}`)
				.setAuthor(newRole.guild.name, newRole.guild.iconURL())
				.addField('Before:', `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))`)
				.addField('After:', `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))`)
				.setTimestamp();
			sendMessage(newRole, settings, embed);
		}

		// role permission change
		if (oldRole.permissions != newRole.permissions) {
			const embed = new MessageEmbed()
				.setDescription(`**Role permissions of ${newRole} (${newRole.name}) changed**\n[What those numbers mean](https://discordapi.com/permissions.html#${oldRole.permissions.bitfield})`)
				.setColor(15105570)
				.setFooter(`ID: ${newRole.id}`)
				.setAuthor(newRole.guild.name, newRole.guild.iconURL())
				.addField('Before:', oldRole.permissions.bitfield)
				.addField('After:', newRole.permissions.bitfield)
				.setTimestamp();
			sendMessage(newRole, settings, embed);
		}
	}
};
