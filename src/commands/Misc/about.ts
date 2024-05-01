// Dependencies
const { version, ChannelType } = require('discord.js'),
	{ Embed, time: { getReadableTime } } = require('../../utils'), ;
import Command from '../../structures/Command';

/**
 * About command
 * @extends {Command}
*/
export default class About extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'about',
			dirname: __dirname,
			aliases: ['bio', 'clientinfo'],
			description: 'Information about me.',
			usage: 'about',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		const embed = this.createEmbed(client, message.guild, settings);
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(client, interaction, guild) {
		const settings = guild.settings;
		const embed = this.createEmbed(client, guild, settings);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating client about embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {settings} settings The settings of the guild
 	 * @returns {embed}
	*/
	createEmbed(client, guild, settings) {
		const textBasedChannelSize = client.channels.cache.filter(c => [ChannelType.GuildAnnouncement, ChannelType.GuildText].includes(c.type)).size,
			voiceBasedChannelSize = client.channels.cache.filter(c => [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(c.type)).size;

		return new Embed(client, guild)
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTitle('misc/about:TITLE')
			.setDescription(guild.translate('misc/about:DESC', { URL: client.config.websiteURL, INVITE: client.generateInvite({
				permissions: BigInt(1073081686),
				scopes: ['client', 'applications.commands'],
			}), SERVER: client.config.SupportServer.link, USERNAME: client.user.displayName }))
			.addFields(
				{ name: guild.translate('misc/about:MEMBERS', { MEMBERS: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString() }), value:  client.translate('misc/about:MEMBERS_DESC', { USERS: client.users.cache.size.toLocaleString(settings.Language), clientS: client.users.cache.filter(user => user.client).size.toLocaleString(settings.Language), HUMANS: client.users.cache.filter(user => !user.client).size.toLocaleString(settings.Language) }), inline: true },
				{ name: guild.translate('misc/about:CHANNELS'), value: client.translate('misc/about:CHANNELS_DESC', { CHANNELS: client.channels.cache.size.toLocaleString(settings.Language), TEXT: textBasedChannelSize.toLocaleString(settings.Language), VOICE: voiceBasedChannelSize.toLocaleString(settings.Language), DM: client.channels.cache.filter(channel => channel.type === 'DM').size.toLocaleString(settings.Language) }), inline: true },
				{ name: guild.translate('misc/about:PROCESS'), value:	client.translate('misc/about:PROCESS_DESC', { RAM: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), NODE: process.version.slice(1).split('.')[0], DISCORD: version }), inline: true },
				{ name: guild.translate('misc/about:SERVERS'), value: client.translate('misc/about:SERVERS_DESC', { SERVERS: client.guilds.cache.size, SHARDS: client.ws.totalShards }), inline: true },
				{ name: guild.translate('misc/about:MESSAGES'), value: client.translate('misc/about:MESSAGES_DESC', { MESSAGES: client.messagesSent, MSGSEC: (client.messagesSent / (client.uptime / 1000)).toFixed(2) }), inline: true },
				{ name: guild.translate('misc/about:UPTIME'), value: getReadableTime(client.uptime), inline: true },
			);
	}
}

