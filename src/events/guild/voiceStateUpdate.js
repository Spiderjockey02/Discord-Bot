// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Voice state update event
 * @event Egglord#VoiceStateUpdate
 * @extends {Event}
*/
class VoiceStateUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
 * Function for recieving event.
 * @param {bot} bot The instantiating client
 * @param {VoiceState} oldState The voice state before the update
 * @param {VoiceState} newState The voice state after the update
 * @readonly
*/
	async run(bot, oldState, newState) {
		// variables for easier coding
		const newMember = newState.guild.members.cache.get(newState.id);
		const channel = newState.guild.channels.cache.get(newState.channel?.id ?? newState.channelId);


		// Get server settings / if no settings then return
		const settings = newState.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event voiceStateUpdate is for logging
		if (settings.ModLogEvents?.includes('VOICESTATEUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// member has been server (un)deafened
			if (oldState.serverDeaf != newState.serverDeaf) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newMember} was server ${newState.serverDeaf ? '' : 'un'}deafened in ${channel.toString()}**`)
					.setColor(newState.serverDeaf ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL });
				updated = true;
			}

			// member has been server (un)muted
			if (oldState.serverMute != newState.serverMute) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newMember} was server ${newState.serverMute ? '' : 'un'}muted in ${channel.toString()}**`)
					.setColor(newState.serverMute ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL });
				updated = true;
			}

			// member has (stopped/started) streaming
			if (oldState.streaming != newState.streaming) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newMember} has ${newState.streaming ? 'started' : 'stopped'} streaming in ${channel.toString()}**`)
					.setColor(newState.streaming ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL });
				updated = true;
			}

			if (updated) {
				// Find channel and send message
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newState.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newState.guild.id) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}

		// Only keep the bot in the voice channel by its self for 3 minutes
		const player = bot.manager?.players.get(newState.guild.id);

		if (!player) return;
		if (!newState.guild.members.cache.get(bot.user.id).voice.channelId) player.destroy();

		// Check for stage channel audience change
		if (newState.id == bot.user.id && channel?.type == 'GUILD_STAGE_VOICE') {
			if (!oldState.channelId) {
				try {
					await newState.guild.me.voice.setSuppressed(false).then(() => console.log(null));
				} catch (err) {
					player.pause(true);
				}
			} else if (oldState.suppress !== newState.suppress) {
				player.pause(newState.suppress);
			}
		}


		if (oldState.id === bot.user.id) return;
		if (!oldState.guild.members.cache.get(bot.user.id).voice.channelId) return;

		// Don't leave channel if 24/7 mode is active
		if (player.twentyFourSeven) return;

		// Make sure the bot is in the voice channel that 'activated' the event
		if (oldState.guild.members.cache.get(bot.user.id).voice.channelId === oldState.channelId) {
			if (oldState.guild.me.voice?.channel && oldState.guild.me.voice.channel.members.filter(m => !m.user.bot).size === 0) {
				const vcName = oldState.guild.me.voice.channel.name;
				await bot.delay(180000);

				// times up check if bot is still by themselves in VC (exluding bots)
				const vcMembers = oldState.guild.me.voice.channel?.members.size;
				if (!vcMembers || vcMembers === 1) {
					const newPlayer = bot.manager?.players.get(newState.guild.id);
					(newPlayer) ? player.destroy() : newState.guild.me.voice.disconnect();
					const embed = new Embed(bot, newState.guild)
					// eslint-disable-next-line no-inline-comments
						.setDescription(`I left 🔉 **${vcName}** because I was inactive for too long.`); // If you are a [Premium](${bot.config.websiteURL}/premium) member, you can disable this by typing ${settings.prefix}24/7.`);
					try {
						const c = bot.channels.cache.get(player.textChannel);
						if (c) c.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 60000 }));
					} catch (err) {
						bot.logger.error(err.message);
					}
				}
			}
		}
	}
}

module.exports = VoiceStateUpdate;
