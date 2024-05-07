import { Prisma } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection, EmbedBuilder, GuildChannel, Message, OverwriteResolvable, PermissionFlagsBits, TextChannel, User } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import { ticketSettingType } from '../types/database';
import { EgglordEmbed } from '../utils';
import { setTimeout } from 'timers/promises';

export default class TicketManager {
	cache: Collection<string, string>;
	client: EgglordClient;
	guildId: string;
	private settings: Prisma.TicketSystemGetPayload<typeof ticketSettingType> | null;
	constructor(client: EgglordClient, guildId: string) {
		this.cache = new Collection();
		this.client = client;
		this.guildId = guildId;
		this.settings = null;
	}

	// Create a new ticket
	async create(user: User, reason?:string) {
		// Check if a ticket already exists
		const guild = this.client.guilds.cache.get(this.guildId);
		if (!guild) return;

		// Check if a ticket already exists
		if (guild.channels.cache.find(channel => channel.name == `ticket-${user.id}`)) return false;

		// Create the permission
		const perms: OverwriteResolvable[] = [
			{ id: user, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
			{ id: guild.roles.everyone, deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
			{ id: this.client.user, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks] },
		];

		// Check for support role
		if (this.settings?.supportRoleId) {
			const supportRole = guild.roles.cache.get(this.settings?.supportRoleId);
			if (supportRole) perms.push({ id: supportRole, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] });
		}

		// Create channel
		const channel = await guild.channels.create({ name: `ticket-${user.id}`,
			type: ChannelType.GuildText,
			reason: reason,
			parent: this.settings?.categoryId,
			permissionOverwrites: perms,
		});

		// Create the embed
		const embed = new EmbedBuilder()
			.setColor(0xFF5555)
			.addFields(
				{ name: guild.translate('ticket/ticket-create:FIELD1', { USERNAME: user.displayName }), value: guild.translate('ticket/ticket-create:FIELDT') },
				{ name: guild.translate('ticket/ticket-create:FIELD2'), value: `${reason}` },
			)
			.setTimestamp();

		// Create the buttons
		const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('close')
				.setLabel('Close')
				.setStyle(ButtonStyle.Danger),
		);

		// Send the embed and button
		const msg = await channel.send({ content:`${user}`, embeds: [embed], components: [buttons] });
		msg.pin();

		// Send mod log
		this.client.emit('ticketCreate', channel, user, reason);
	}

	// Delete a ticket
	async delete(channelId: string) {
		const guild = this.client.guilds.cache.get(this.guildId);
		if (!guild) return false;

		const channel = guild.channels.cache.get(channelId) as TextChannel;
		if (!channel) return;

		// Fetch the transcript
		await this.transcript(channel.id);

		// Delete the channel
		if (channel.deletable) await channel.delete();
		this.client.emit('ticketClose', channel);
	}

	// Get all messages from the ticket
	async transcript(channelId: string) {
		const guild = this.client.guilds.cache.get(this.guildId);
		if (!guild) return false;

		const channel = guild.channels.cache.get(channelId) as TextChannel;
		if (!channel) return false;

		// Fetch all messages
		const totalMessages: Message[] = [];
		const messages = await channel.messages.fetch({ cache: false });
		totalMessages.push(...messages.values());

		if (messages.size > 100) {
			let responseSize = messages.size;
			while (responseSize == 100) {
				const m = await channel.messages.fetch({ after: messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first()?.id });
				if (m.size < 100) responseSize = m.size;
				totalMessages.push(...m.values());
				await setTimeout(20_000);
			}
		}

		return JSON.stringify(totalMessages);
	}

	async createEmbed(channel: GuildChannel) {
		if (!channel.isTextBased()) return false;

		const embed = new EgglordEmbed(this.client, channel.guild)
			.setTitle('ticket/ticket:TITLE_REACT')
			.setDescription(channel.guild.translate('ticket/ticket:REACT_DESC'));
			// Create button
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('crt_ticket')
					.setLabel('Create ticket')
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('📩'),
			);

		await channel.send({ embeds: [embed], components: [row] });
	}
}