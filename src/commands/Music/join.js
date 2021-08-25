// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Join command
 * @extends {Command}
*/
class Join extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'join',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['movehere'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Makes the bot join your voice channel.',
			usage: 'join',
			cooldown: 3000,
			slash: true,
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(message.guild.id);

		// Make sure the user is in a voice channel
		if (!message.member.voice.channel) return message.channel.error('music/join:NO_VC');

		// Check if VC is full and bot can't join doesn't have (MANAGE_CHANNELS)
		if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.me).has('MOVE_MEMBERS')) {
			return message.channel.error('music/play:VC_FULL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// If no player (no song playing) create one and join channel
		if (!player) {
			try {
				await bot.manager.create({
					guild: message.guild.id,
					voiceChannel: message.member.voice.channel.id,
					textChannel: message.channel.id,
					selfDeafen: true,
				}).connect();
				const embed = new MessageEmbed(bot, message.guild)
					.setColor(message.member.displayHexColor)
					.setDescription(bot.translate('music/join:JOIN'));
				message.channel.send({ embeds:[embed] });
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			// Move the bot to the new voice channel / update text channel
			try {
				await player.setVoiceChannel(message.member.voice.channel.id);
				await player.setTextChannel(message.channel.id);
				const embed = new MessageEmbed(bot, message.guild)
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('music/join:MOVED'));
				message.channel.send({ embeds: [embed] });
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)], ephemeral: true });
			}
		}
		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);

		// Make sure the user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ embeds: [channel.error('music/join:NO_VC', { ERROR: null }, true)], ephemeral: true });

		// Check if VC is full and bot can't join doesn't have (MANAGE_CHANNELS)
		if (member.voice.channel.full && !member.voice.channel.permissionsFor(guild.me).has('MOVE_MEMBERS')) {
			return interaction.reply({ embeds: [channel.error('music/join:VC_FULL', { ERROR: null }, true)], ephemeral: true });
		}

		// If no player (no song playing) create one and join channel
		if (!player) {
			try {
				await bot.manager.create({
					guild: guild.id,
					voiceChannel: member.voice.channel.id,
					textChannel: channel.id,
					selfDeafen: true,
				}).connect();
				const embed = new MessageEmbed(bot, guild)
					.setColor(member.displayHexColor)
					.setDescription(bot.translate('music/join:JOIN'));
				interaction.reply({ embeds:[embed] });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		} else {
			// Move the bot to the new voice channel / update text channel
			try {
				await player.setVoiceChannel(member.voice.channel.id);
				await player.setTextChannel(channel.id);
				const embed = new MessageEmbed(bot, guild)
					.setColor(member.displayHexColor)
					.setDescription(bot.translate('music/join:MOVED'));
				interaction.reply({ embeds:[embed] });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		}
	}
}

module.exports = Join;
