// Dependencies
const { Embed } = require('../../utils'),
	types = {
		GUILD_TEXT: 'Text',
		GUILD_VOICE: 'Voice',
		GUILD_CATEGORY: 'Category',
		GUILD_STAGE_VOICE: 'Stage',
		GUILD_NEWS: 'Annoucement',
		GUILD_STORE: 'Store',
	},
	Event = require('../../structures/Event');


/**
 * Channel update event
 * @event Egglord#ChannelDelete
 * @extends {Event}
*/
class ChannelUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildChannel|DMChannel} oldChannel The channel before the update
	 * @param {GuildChannel|DMChannel} newChannel The channel after the update
	 * @readonly
	*/
	async run(bot, oldChannel, newChannel) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${newChannel.type == 'dm' ? newChannel.recipient.tag : newChannel.name} has been updated${newChannel.type == 'dm' ? '' : ` in guild: ${newChannel.guild.id}`}. (${types[newChannel.type]})`);

		// Get server settings / if no settings then return
		const settings = newChannel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelDelete is for logging
		if (settings.ModLogEvents?.includes('CHANNELUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// Channel name change
			if (oldChannel.name != newChannel.name) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${newChannel.type === 'GUILD_CATEGORY' ? 'Category' : 'Channel'} name changed of ${newChannel.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldChannel.name}`, inline: true },
						{ name: 'New:', value: `${newChannel.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// channel topic (description) change
			if (oldChannel.topic != newChannel.topic) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${newChannel.type === 'GUILD_CATEGORY' ? 'Category' : 'Channel'} topic changed of ${newChannel.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldChannel.topic ? oldChannel.topic : '*empty topic*'}`, inline: true },
						{ name: 'New:', value: `${newChannel.topic ? newChannel.topic : '*empty topic*'}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			if (oldChannel.rtcRegion != newChannel.rtcRegion) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${newChannel.type === 'GUILD_CATEGORY' ? 'Category' : 'Channel'} region changed of ${newChannel.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldChannel.rtcRegion}`, inline: true },
						{ name: 'New:', value: `${newChannel.rtcRegion}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Check for permission change
			const permDiff = oldChannel.permissionOverwrites.cache.filter(x => {
				if (newChannel.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield) && newChannel.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield)) {
					return false;
				}
				return true;
			}).concat(newChannel.permissionOverwrites.cache.filter(x => {
				if (oldChannel.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield) && oldChannel.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield)) {
					return false;
				}
				return true;
			}));

			if (permDiff.size) {
				embed = new Embed(bot, newChannel.guild)
					.setDescription(`**${newChannel.type === 'GUILD_CATEGORY' ? 'Category' : 'Channel'} permissions changed of ${newChannel.toString()}**\n*note:* check [docs](https://discordapp.com/developers/docs/topics/permissions) to see what the numbers mean`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newChannel.id}` })
					.setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL() })
					.setTimestamp();
				for (const permID of permDiff.keys()) {
					// load both overwrites into variables
					const oldPerm = oldChannel.permissionOverwrites.cache.get(permID) || {};
					const newPerm = newChannel.permissionOverwrites.cache.get(permID) || {};
					const oldBitfields = {
						allowed: oldPerm.allow ? oldPerm.allow.bitfield : 0,
						denied: oldPerm.deny ? oldPerm.deny.bitfield : 0,
					};
					const newBitfields = {
						allowed: newPerm.allow ? newPerm.allow.bitfield : 0,
						denied: newPerm.deny ? newPerm.deny.bitfield : 0,
					};
					// load roles / guildmember for that overwrite
					let role;
					let member;
					if (oldPerm.type == 'role' || newPerm.type == 'role') {
						role = newChannel.guild.roles.cache.get(newPerm.id || oldPerm.id);
					}
					if (oldPerm.type == 'member' || newPerm.type == 'member') {
						member = await newChannel.guild.members.fetch(newPerm.id || oldPerm.id);
					}
					// make text about what changed
					let value = '';
					if (oldBitfields.allowed !== newBitfields.allowed) {
						value += `Allowed Perms: \`${oldBitfields.allowed}\` to \`${newBitfields.allowed}\`\n`;
					}
					if (oldBitfields.denied !== newBitfields.denied) {
						value += `Denied Perms: \`${oldBitfields.denied}\` to \`${newBitfields.denied}\``;
					}
					if (!value.length) value = 'Overwrite got deleted';
					// add field to embed
					embed.fields.push({
						'name': role ? role.name + ` (ID: ${role.id}):` : member.user.username + ` (ID: ${member.id}):`,
						'value': value,
					});
				}
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newChannel.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newChannel.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

module.exports = ChannelUpdate;
