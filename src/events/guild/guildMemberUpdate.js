// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Guild member update event
 * @event Egglord#GuildMemberUpdate
 * @extends {Event}
*/
class GuildMemberUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildMember} oldMember The member before the update
	 * @param {GuildMember} newMember The member after the update
	 * @readonly
	*/
	async run(bot, oldMember, newMember) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${newMember.user.tag} has been updated in guild: ${newMember.guild.id}.`);

		if (oldMember.user.id == bot.user.id) return;

		// if the oldMember is not cached ignore.
		if (oldMember.partial) return;

		// get server settings
		const settings = newMember.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('GUILDMEMBERUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// nickname change
			if (oldMember.nickname != newMember.nickname) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} nickname changed**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
					.addFields(
						{ name: 'Before:', value: `${oldMember.nickname ? oldMember.nickname : '*None*'}`, inline: true },
						{ name: 'After:', value: `${newMember.nickname ? newMember.nickname : '*None*'}`, inline: true })
					.setTimestamp();
				updated = true;
			}

			// Look to see if user has boosted the server
			if (!oldMember.premiumSince && newMember.premiumSince) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} has boosted the server**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
					.setTimestamp();
				updated = true;
			}

			// Look to see if user has stopped boosted the server
			if (oldMember.premiumSince && !newMember.premiumSince) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} has unboosted the server**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
					.setTimestamp();
				updated = true;
			}

			// Look to see if user has changed their username
			if (oldMember.username !== newMember.username) {
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**username changed of ${newMember.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
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
				const roleAddedString = [];
				for (const role of [...rolesAdded.values()]) {
					roleAddedString.push(role.toString());
				}
				const roleRemovedString = [];
				for (const role of [...rolesRemoved.values()]) {
					roleRemovedString.push(role.toString());
				}
				embed = new Embed(bot, newMember.guild)
					.setDescription(`**${newMember.toString()} roles changed**`)
					.setFooter({ text: `ID: ${newMember.id}` })
					.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
					.addFields(
						{ name: `Added roles [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? '*None*' : roleAddedString.join('\n ')}`, inline: true },
						{ name: `Removed Roles [${rolesRemoved.size}]:`, value: `${roleRemovedString.length == 0 ? '*None*' : roleRemovedString.join('\n ')}`, inline: true })
					.setTimestamp();
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newMember.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newMember.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// check if member lost mute role manually
		if (oldMember.roles.cache.filter(x => !newMember.roles.cache.get(x.id)).map(r => r.id).includes(settings.MutedRole)) {
			try {
				await newMember.guild.updateGuild({ MutedMembers: settings.MutedMembers.filter(user => user != newMember.user.id) });
				settings.MutedMembers.filter(user => user != newMember.user.id);
			} catch (err) {
				bot.logger.error(`${newMember.user.id}`);
			}
		}
	}
}

module.exports = GuildMemberUpdate;
