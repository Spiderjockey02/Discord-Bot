// Dependencies
const { Embed } = require('../../utils'),
	{ ChannelType } = require('discord.js'),
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
 * Function for receiving event.
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
					.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
				updated = true;
			}

			// member has been server (un)muted
			if (oldState.serverMute != newState.serverMute) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newMember} was server ${newState.serverMute ? '' : 'un'}muted in ${channel.toString()}**`)
					.setColor(newState.serverMute ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
				updated = true;
			}

			// member has (stopped/started) streaming
			if (oldState.streaming != newState.streaming) {
				embed = new Embed(bot, newState.guild)
					.setDescription(`**${newMember} has ${newState.streaming ? 'started' : 'stopped'} streaming in ${channel.toString()}**`)
					.setColor(newState.streaming ? 15158332 : 3066993)
					.setTimestamp()
					.setFooter({ text: `User: ${newMember.id}` })
					.setAuthor({ name: newMember.user.displayName, iconURL: newMember.user.displayAvatarURL() });
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

		const player = bot.manager?.players.get(newState.guild.id);
		if (!player || player.destroyed) return;

		if (newState.id == bot.user.id) {
			// The bot was moved to another channel or disconnected by someone
			if (oldState.channelId && oldState.channelId !== newState.channelId) {
				bot.manager.emit('playerMove', player, oldState.channelId, newState.channelId);
				if (!newState.channelId) return;
			}

			// Check for stage channel audience change
			if (channel?.type == ChannelType.GuildStageVoice) {
				if (!oldState.channelId || oldState.channelId !== newState.channelId) {
					try {
						await newState.guild.members.me.voice.setSuppressed(false);
					} catch (err) {
						player.pause(true, 'suppressed');
					}
				} else if (oldState.suppress !== newState.suppress) {
					player.pause(newState.suppress, 'suppressed');
				}
			}
		}

		// Only updates for the bot's own voice channel matter from here
		const botChannel = newState.guild.members.me?.voice.channel;
		if (!botChannel || (oldState.channelId !== botChannel.id && newState.channelId !== botChannel.id)) return;

		// Pause while nobody is listening, and leave after 3 minutes unless 24/7 mode is on
		const alone = botChannel.members.filter(m => !m.user.bot).size === 0;
		player.setAlone(alone, 180000, () => {
			const embed = new Embed(bot, newState.guild)
				.setDescription(`I left 🔉 **${botChannel.name}** because I was inactive for too long.`);
			bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] })
				.then(m => m.timedDelete({ timeout: 60000 }))
				.catch(err => bot.logger.error(err.message));
		});
	}
}

module.exports = VoiceStateUpdate;
