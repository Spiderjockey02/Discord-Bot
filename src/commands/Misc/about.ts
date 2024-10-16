import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ChannelType, ChatInputCommandInteraction, Guild, Message, OAuth2Scopes, version } from 'discord.js';

/**
 * About command
 * @extends {Command}
*/
export default class About extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'about',
			dirname: __dirname,
			aliases: ['bio', 'clientinfo'],
			description: 'Information about me.',
			usage: 'about',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const embed = this.createEmbed(client, message.guild);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const embed = this.createEmbed(client, interaction.guild);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating client about embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
 	 * @returns {embed}
	*/
	createEmbed(client: EgglordClient, guild: Guild | null) {
		const textBasedChannelSize = client.channels.cache.filter(c => c.isTextBased()).size,
			voiceBasedChannelSize = client.channels.cache.filter(c => c.isVoiceBased()).size;

		return new EgglordEmbed(client, guild)
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTitle('misc/about:TITLE')
			.setDescription(client.languageManager.translate(guild, 'misc/about:DESC', { URL: client.config.websiteURL, INVITE: client.generateInvite({
				permissions: BigInt(1073081686),
				scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			}), SERVER: client.config.SupportServer.link, USERNAME: client.user.displayName }))
			.addFields(
				{ name: client.languageManager.translate(guild, 'misc/about:MEMBERS', { MEMBERS: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString() }), value:  client.languageManager.translate(guild, 'misc/about:MEMBERS_DESC', { USERS: client.users.cache.size, clientS: client.users.cache.filter(user => user.client).size, HUMANS: client.users.cache.filter(user => !user.client).size }), inline: true },
				{ name: 'misc/about:CHANNELS', value: client.languageManager.translate(guild, 'misc/about:CHANNELS_DESC', { CHANNELS: client.channels.cache.size, TEXT: textBasedChannelSize, VOICE: voiceBasedChannelSize, DM: client.channels.cache.filter(channel => channel.type === ChannelType.DM).size }), inline: true },
				{ name: 'misc/about:PROCESS', value:	client.languageManager.translate(guild, 'misc/about:PROCESS_DESC', { RAM: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), NODE: process.version.slice(1).split('.')[0], DISCORD: version }), inline: true },
				{ name: 'misc/about:SERVERS', value: client.languageManager.translate(guild, 'misc/about:SERVERS_DESC', { SERVERS: client.guilds.cache.size, SHARDS: client.ws.shards.size }), inline: true },
				{ name: 'misc/about:MESSAGES', value: client.languageManager.translate(guild, 'misc/about:MESSAGES_DESC', { MESSAGES: client.messagesReceived, MSGSEC: (client.messagesReceived / (client.uptime / 1000)).toFixed(2) }), inline: true },
				{ name: 'misc/about:UPTIME', value: `${client.uptime}`, inline: true },
			);
	}
}

