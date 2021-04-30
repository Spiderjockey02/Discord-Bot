// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class guildMemberUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, oldMember, newMember) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${newMember.user.tag} has been updated in guild: ${newMember.guild.id}.`);

		if (oldMember.user.id == bot.user.id) return;

		// get server settings
		const settings = newMember.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents.includes('GUILDMEMBERUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// nickname change
			if (oldMember.nickname != newMember.nickname) {
				embed = new MessageEmbed()
					.setDescription(`**${newMember.toString()} nickname changed**`)
					.setFooter(`ID: ${newMember.id}`)
					.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
					.addFields(
						{ name: 'Before:', value: `${oldMember.nickname ? oldMember.nickname : '*None*'}`, inline: true },
						{ name: 'After:', value: `${newMember.nickname ? newMember.nickname : '*None*'}`, inline: true })
					.setTimestamp();
				updated = true;
			}

			// Look to see if user has boosted the server
			if (!oldMember.premiumSince && newMember.premiumSince) {
				embed = new MessageEmbed()
					.seDescripition(`**${newMember.toString()} has boosted the server**`)
					.setFooter(`ID: ${newMember.id}`)
					.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
					.setTimestamp();
				updated = true;
			}

			// Look to see if user has stopped boosted the server
			if (oldMember.premiumSince && !newMember.premiumSince) {
				embed = new MessageEmbed()
					.seDescripition(`**${newMember.toString()} has unboosted the server**`)
					.setFooter(`ID: ${newMember.id}`)
					.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
					.setTimestamp();
				updated = true;
			}

			// Look to see if user has changed their surname
			if (oldMember.username !== newMember.username) {
				embed = new MessageEmbed()
					.setDescription(`**username changed of ${newMember.toString()}**`)
					.setColor(15105570)
					.setFooter(`ID: ${newMember.id}`)
					.setAuthor(newMember.guild.name, newMember.guild.iconURL())
					.addFields(
						{ name: 'Old:', value: `${oldMember.name}`, inline: true },
						{ name: 'New:', value: `${newMember.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// look for role change
			const rolesAdded = newMember.roles.cache.filter(x => !oldMember.roles.cache.get(x.id));
			const rolesRemoved = oldMember.roles.cache.filter(x => !newMember.roles.cache.get(x.id));
			if (rolesAdded.size != 0 || rolesRemoved.size != 0) {
				let roleAddedString = '';
				for (const role of rolesAdded.array()) {
					roleAddedString += role.toString();
				}
				let roleRemovedString = '';
				for (const role of rolesRemoved.array()) {
					roleRemovedString += role.toString();
				}
				embed = new MessageEmbed()
					.setDescription(`**${newMember.toString()} roles changed**`)
					.setFooter(`ID: ${newMember.id}`)
					.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
					.addFields(
						{ name: `Added role [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? '*None*' : roleAddedString}`, inline: true },
						{ name: `Removed Roles [${rolesRemoved.size}]:`, value: `${roleRemovedString.length == 0 ? '*None*' : roleRemovedString}`, inline: true })
					.setTimestamp();
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newMember.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, embed);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
};
