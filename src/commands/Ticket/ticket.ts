// Dependencies
const { Embed } = require('../../utils'),
	{ ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Ticket command
 * @extends {Command}
*/
export default class Ticket extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'ticket',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['ticket'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Information on ticket plugin.',
			usage: 'ticket',
			cooldown: 3000,
			slash: true,
			options: [
				{
					name: 'reaction',
					description: 'Create reaction embed',
					type: ApplicationCommandOptionType.Subcommand,
				},
				...client.subCommands.filter(c => c.help.category == 'Ticket' && c.help.name !== 'ticket').map(c => ({
					name: c.help.name.replace('ticket-', ''),
					description: c.help.description,
					type: ApplicationCommandOptionType.Subcommand,
					options: c.conf.options,
				})),
			],
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
		// Add ticket reaction embed
		if (message.args[0] == 'reaction') {
			await this.sendReactionEmbed(client, message.channel);
		} else {
			const embed = new Embed(client, message.guild)
				.setTitle('ticket/ticket:TITLE')
				.setDescription([
					`\`${settings.prefix}t-<open|create> [reason]\` - ${message.translate('ticket/ticket-create:DESCRIPTION')}.`,
					`\`${settings.prefix}t-close\` - ${message.translate('ticket/ticket-close:DESCRIPTION')} (Support only).`,
					`\`${settings.prefix}t-setup\` - ${message.translate('ticket/ticket-setup:DESCRIPTION')} (Admin only).`,
					`\`${settings.prefix}ticket reaction\` - Add reaction ticket embed (Admin only).`,
				].join('\n'));
			message.channel.send({ embeds: [embed] });
		}

	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const option = interaction.options.getSubcommand();

		// Get the user's option and run it
		if (option == 'reaction') {
			await this.sendReactionEmbed(client, interaction.channel);
			interaction.reply({ content: 'Created embed', ephermal: true });
		} else {
			const command = client.subCommands.get(`ticket-${option}`);
			if (command) {
				command.callback(client, interaction, guild, args);
			} else {
				interaction.reply({ content: 'Error' });
			}
		}
	}

	/**
	 * Function for sending reaction/button embed
	 * @param {client} client The instantiating client
	 * @param {channel} channel The channel that will show the embed
	 * @readonly
	*/
	async sendReactionEmbed(client, channel) {
		const { guild } = channel;

		const embed = new Embed(client, guild)
			.setTitle('ticket/ticket:TITLE_REACT')
			.setDescription(guild.translate('ticket/ticket:REACT_DESC', { PREFIX: guild.settings.prefix }));
			// Create button
		const row = new ActionRowBuilder()
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

