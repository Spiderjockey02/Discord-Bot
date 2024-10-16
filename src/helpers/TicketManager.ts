import { Prisma } from '@prisma/client';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection, GuildTextBasedChannel, IntentsBitField, OverwriteResolvable, PermissionFlagsBits, User } from 'discord.js';
import EgglordClient from '../base/Egglord';
import { ticketSettingType } from '../types/database';
import { setTimeout } from 'timers/promises';
import { EgglordEmbed, ErrorEmbed, SuccessEmbed } from '../structures';

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

	/**
	 * Function for create a new ticket
	 * @param {User?} user The user who wants to create the ticket
	 * @param {string?} reason The reason for the ticket creation
	 * @return {Promise<ErrorEmbed>}
	*/
	async create(user: User, reason?:string): Promise<ErrorEmbed> {
		// Check if a ticket already exists
		const guild = this.client.guilds.cache.get(this.guildId);
		if (!guild) {
			return new ErrorEmbed(this.client, null)
				.setMessage('events/message:GUILD_ONLY');
		}

		// Check if a ticket already exists
		if (guild.channels.cache.find(channel => channel.name == `ticket-${user.id}`)) {
			return new ErrorEmbed(this.client, guild)
				.setMessage('ticket/ticket-create:TICKET_EXISTS');
		}

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

		try {
			// Create channel
			const channel = await guild.channels.create({ name: `ticket-${user.id}`,
				type: ChannelType.GuildText,
				reason: reason,
				parent: this.settings?.categoryId,
				permissionOverwrites: perms,
			});

			// Create the embed
			const embed = new EgglordEmbed(this.client, guild)
				.addFields(
					{ name: this.client.languageManager.translate(guild, 'ticket/ticket-create:FIELD1', { USERNAME: user.displayName }), value: this.client.languageManager.translate(guild, 'ticket/ticket-create:FIELDT') },
					{ name: 'ticket/ticket-create:FIELD2', value: `${reason}` },
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

			return new SuccessEmbed(this.client, guild)
				.setMessage('ticket/ticket-create:DESC', { CHANNEL: channel.id });
		} catch (err: any) {
			return new ErrorEmbed(this.client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
	 * Function for deleting a ticket
	 * @param {GuildTextBasedChannel | null} channel The text channel to fetch the transcript from
	 * @param {boolean} fetchTranscript The text channel to fetch the transcript from
	 * @return {Promise<boolean>}
	*/
	async delete(channel: GuildTextBasedChannel | null, fetchTranscript: boolean): Promise<boolean> {
		if (!channel) return false;

		try {
			// Fetch the transcript
			let transcript: AttachmentBuilder | null = null;
			if (fetchTranscript) transcript = await this.transcript(channel);

			// Delete the channel
			await channel.delete();
			this.client.emit('ticketClose', channel, transcript);
			return true;
		} catch (err: any) {
			this.client.logger.error(err);
			return false;
		}
	}

	/**
	 * Function for getting all messages from a single ticket channel
	 * @param {GuildTextBasedChannel | null} channel The text channel to fetch the transcript from
	 * @return {Promise<AttachmentBuilder | null>}
	*/
	async transcript(channel: GuildTextBasedChannel | null): Promise<AttachmentBuilder | null> {
		// Ensure the bot has permission to read message content
		if (!this.client.options.intents.has(IntentsBitField.Flags.MessageContent)) return null;

		// Make sure the channel is not null
		if (!channel) return null;

		// NEED TO REWRITE THIS ENTIRE THING
		// Fetch all messages
		try {
			const parsedTranscript = [];
			let messages = await channel.messages.fetch({ cache: false });
			parsedTranscript.push(...[...messages.values()].map(m =>
				({ id: m.id,
					displayName: m.author.displayName,
					avatar: m.author.avatarURL(),
					content: m.content,
					embeds: m.embeds.map(c => c.toJSON()),
				}),
			));

			// Loop until all messages have been fetched from the ticket channel
			while (messages.size >= 100) {
				messages = await channel.messages.fetch({ after: messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first()?.id });
				parsedTranscript.push(...[...messages.values()].map(m =>
					({ id: m.id,
						displayName: m.author.displayName,
						avatar: m.author.avatarURL(),
						content: m.content,
						embeds: m.embeds.map(c => c.toJSON()),
					}),
				));
				await setTimeout(15_000);
			}

			// Create the attachment to send in the mod log channel (if enabled)
			const transcriptBuffer = Buffer.from(JSON.stringify(parsedTranscript), 'utf-8');
			return new AttachmentBuilder(transcriptBuffer, { name: `transcript-${channel.name}.json` });
		} catch (err: any) {
			this.client.logger.error(err);
			return null;
		}
	}

	/**
	 * Function for creating a reaction embed so people can easily make tickets
	 * @param {GuildTextBasedChannel | null} channel The text channel to post the embed in
	 * @return {Promise<Boolean>}
	*/
	async createEmbed(channel: GuildTextBasedChannel | null): Promise<boolean> {
		if (!channel) return false;

		try {
			const embed = new EgglordEmbed(this.client, channel.guild)
				.setTitle('ticket/ticket:TITLE_REACT')
				.setDescription(this.client.languageManager.translate(channel.guild, 'ticket/ticket:REACT_DESC'));
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
			return true;
		} catch (err: any) {
			this.client.logger.error(err);
			return false;
		}
	}
}