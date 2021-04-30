// Dependencies
const { MessageEmbed } = require('discord.js'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
	Event = require('../../structures/Event');

module.exports = class voiceStateUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, oldState, newState) {
		// variables for easier coding
		const newMember = newState.guild.member(newState.id);
		const channel = newState.guild.channels.cache.get(newState.channelID);

		// Get server settings / if no settings then return
		const settings = newState.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event voiceStateUpdate is for logging
		if (settings.ModLogEvents.includes('VOICESTATEUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// member has been server (un)deafened
			if (oldState.serverDeaf != newState.serverDeaf) {
				embed = new MessageEmbed()
					.setDescription(`**${newMember} was server ${newState.serverDeaf ? '' : 'un'}deafened in ${channel.toString()}**`)
					.setColor(newState.serverDeaf ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter(`User: ${newMember.id}`)
					.setAuthor(newMember.user.username, newMember.user.displayAvatarURL);
				updated = true;
			}

			// member has been server (un)muted
			if (oldState.serverMute != newState.serverMute) {
				embed = new MessageEmbed()
					.setDescription(`**${newMember} was server ${newState.serverMute ? '' : 'un'}muted in ${channel.toString()}**`)
					.setColor(newState.serverMute ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter(`User: ${newMember.id}`)
					.setAuthor(newMember.user.username, newMember.user.displayAvatarURL);
				updated = true;
			}

			// member has (stopped/started) streaming
			if (oldState.streaming != newState.streaming) {
				embed = new MessageEmbed()
					.setDescription(`**${newMember} has ${newState.streaming ? 'started' : 'stopped'} streaming in ${channel.toString()}**`)
					.setColor(newState.streaming ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter(`User: ${newMember.id}`)
					.setAuthor(newMember.user.username, newMember.user.displayAvatarURL);
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newState.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, embed);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// Only keep the bot in the voice channel by its self for 3 minutes
		const player = bot.manager.players.get(newState.guild.id);

		if (!player) return;
		if (!newState.guild.members.cache.get(bot.user.id).voice.channelID) player.destroy();
		if (oldState.id === bot.user.id) return;
		if (!oldState.guild.members.cache.get(bot.user.id).voice.channelID) return;

		// Don't leave channel if 24/7 mode is active
		if (player.twentyFourSeven) return;

		// Make sure the bot is in the voice channel that 'activated' the event
		if (oldState.guild.members.cache.get(bot.user.id).voice.channelID === oldState.channelID) {
			if (oldState.guild.voice.channel && oldState.guild.voice.channel.members.filter(m => !m.user.bot).size === 0) {
				const vcName = oldState.guild.me.voice.channel.name;
				await delay(180000);

				// times up check if bot is still by themselves in VC (exluding bots)
				const vcMembers = oldState.guild.voice.channel.members.size;
				if (!vcMembers || vcMembers === 1) {
					const newPlayer = bot.manager.players.get(newState.guild.id);
					(newPlayer) ? player.destroy() : oldState.guild.voice.channel.leave();
					const embed = new MessageEmbed()
					// eslint-disable-next-line no-inline-comments
						.setDescription(`I left 🔉 **${vcName}** because I was inactive for too long.`); // If you are a [Premium](${bot.config.websiteURL}/premium) member, you can disable this by typing ${settings.prefix}24/7.`);
					try {
						const c = bot.channels.cache.get(player.textChannel);
						if (c) c.send(embed).then(m => m.delete({ timeout: 60000 }));
					} catch (err) {
						bot.logger.error(err.message);
					}
				}
			}
		}
	}
};
