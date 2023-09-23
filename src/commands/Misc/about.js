// Dependencies
const { version, ChannelType } = require('discord.js'),
	{ Embed, time: { getReadableTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * About command
 * @extends {Command}
*/
class About extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'about',
			dirname: __dirname,
			aliases: ['bio', 'botinfo'],
			description: 'Information about me.',
			usage: 'about',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		const embed = this.createEmbed(bot, message.guild, settings);
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const settings = guild.settings;
		const embed = this.createEmbed(bot, guild, settings);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating bot about embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {settings} settings The settings of the guild
 	 * @returns {embed}
	*/
	createEmbed(bot, guild, settings) {
		const textBasedChannelSize = bot.channels.cache.filter(c => [ChannelType.GuildAnnouncement, ChannelType.GuildText].includes(c.type)).size,
			voiceBasedChannelSize = bot.channels.cache.filter(c => [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(c.type)).size;

		return new Embed(bot, guild)
			.setAuthor({ name: bot.user.displayName, iconURL: bot.user.displayAvatarURL() })
			.setTitle('misc/about:TITLE')
			.setDescription(guild.translate('misc/about:DESC', { URL: bot.config.websiteURL, INVITE: bot.generateInvite({
				permissions: BigInt(1073081686),
				scopes: ['bot', 'applications.commands'],
			}), SERVER: bot.config.SupportServer.link, USERNAME: bot.user.displayName }))
			.addFields(
				{ name: guild.translate('misc/about:MEMBERS', { MEMBERS: bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString() }), value:  bot.translate('misc/about:MEMBERS_DESC', { USERS: bot.users.cache.size.toLocaleString(settings.Language), BOTS: bot.users.cache.filter(user => user.bot).size.toLocaleString(settings.Language), HUMANS: bot.users.cache.filter(user => !user.bot).size.toLocaleString(settings.Language) }), inline: true },
				{ name: guild.translate('misc/about:CHANNELS'), value: bot.translate('misc/about:CHANNELS_DESC', { CHANNELS: bot.channels.cache.size.toLocaleString(settings.Language), TEXT: textBasedChannelSize.toLocaleString(settings.Language), VOICE: voiceBasedChannelSize.toLocaleString(settings.Language), DM: bot.channels.cache.filter(channel => channel.type === 'DM').size.toLocaleString(settings.Language) }), inline: true },
				{ name: guild.translate('misc/about:PROCESS'), value:	bot.translate('misc/about:PROCESS_DESC', { RAM: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), NODE: process.version.slice(1).split('.')[0], DISCORD: version }), inline: true },
				{ name: guild.translate('misc/about:SERVERS'), value: bot.translate('misc/about:SERVERS_DESC', { SERVERS: bot.guilds.cache.size, SHARDS: bot.ws.totalShards }), inline: true },
				{ name: guild.translate('misc/about:MESSAGES'), value: bot.translate('misc/about:MESSAGES_DESC', { MESSAGES: bot.messagesSent, MSGSEC: (bot.messagesSent / (bot.uptime / 1000)).toFixed(2) }), inline: true },
				{ name: guild.translate('misc/about:UPTIME'), value: getReadableTime(bot.uptime), inline: true },
			);
	}
}

module.exports = About;
