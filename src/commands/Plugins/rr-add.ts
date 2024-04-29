// Dependencies
const Command = require('../../structures/Command.js'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags }, ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	{ Embed } = require('../../utils');

/**
 * Reaction role add command
 * @extends {Command}
*/
class ReactionRoleAdd extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rr-add',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['reactionroles-add'],
			userPermissions: [Flags.ManageGuild],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions, Flags.ManageRoles],
			description: 'Create a reaction role',
			usage: 'rr-add [channelID / message link]',
			cooldown: 5000,
			examples: ['rr-add 3784484	8481818441'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'name',
				description: 'The title of the new reaction role.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}, {
				name: 'channel',
				description: 'Channel to post the embed in.',
				type: ApplicationCommandOptionType.Channel,
				channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNews],
				required: false,
			}],
		});
	}

	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(args.get('channel')?.value ?? interaction.channelId);
		const name = args.get('name').value;

		// Make sure channel is a text channel and permission
		if (!channel.permissionsFor(bot.user).has(Flags.ViewChannel) || !channel.isTextBased()) {
			return interaction.reply({ embeds: [channel.error('misc:MISSING_CHANNEL', null, true)], ephemeral: true });
		} else if (!channel.permissionsFor(bot.user).has(Flags.SendMessages)) {
			return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:SendMessages') }, true)], ephemeral: true });
		} else if (!channel.permissionsFor(bot.user).has(Flags.EmbedLinks)) {
			return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:EmbedLinks') }, true)], ephemeral: true });
		} else if (!channel.permissionsFor(bot.user).has(Flags.AddReactions)) {
			return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: guild.translate('permissions:AddReactions') }, true)], ephemeral: true });
		}

		// Create select menu
		const row = new ActionRowBuilder()
			.addComponents(
				new RoleSelectMenuBuilder()
					.setCustomId(`rr-${name}`)
					.setPlaceholder('Select multiple roles.')
					.setMinValues(1)
					.setMaxValues(10),
			);
		interaction.reply({ content: 'Select roles for reaction roles:', components: [row] });
	}
}

module.exports = ReactionRoleAdd;
