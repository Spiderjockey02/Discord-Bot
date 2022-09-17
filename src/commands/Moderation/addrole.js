// Dependencies
const fs = require('fs'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Addrole command
 * @extends {Command}
*/
class AddRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'addrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['createrole'],
			userPermissions: [Flags.ManageRoles],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles],
			description: 'Adds a new role to the server',
			usage: 'addrole <role name> [hex color] [hoist]',
			cooldown: 5000,
			examples: ['addrole Test #FF0000 true'],
			slash: false,
			options: [
				{
					name: 'name',
					description: 'Name of the new roll.',
					type: ApplicationCommandOptionType.String,
					maxLength: 100,
					required: true,
				},
				{
					name: 'colour',
					description: 'colour of the new role',
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: true,
				},
				{
					name: 'hoist',
					description: 'Should the role show seperately.',
					type: ApplicationCommandOptionType.Boolean,
					required: true,
				},
			],
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
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure a role name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/addrole:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Max character length of 100 for role name
		if (message.args[0].length >= 100) return message.channel.error('moderation/addrole:MAX_NAME').then(m => m.timedDelete({ timeout: 5000 }));

		// Make sure 'hoist' is true or false
		if (message.args[2] && !['true', 'false'].includes(message.args[2])) return message.channel.error('moderation/addrole:BOOLEAN').then(m => m.timedDelete({ timeout: 5000 }));

		// Make sure there isn't already the max number of roles in the guilds
		if (message.guild.roles.cache.size == 250) return message.channel.error('moderation/addrole:MAX_ROLES').then(m => m.timedDelete({ timeout: 5000 }));

		// Check colour name for role
		fs.readFile('./src/assets/json/colours.json', async (err, data) => {
			if (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Create role
			const { colourNames } = JSON.parse(data);
			const colour = (message.args[1]?.toLowerCase())?.replace(/\s/g, '');
			if (colourNames[colour] ?? /[0-9A-Fa-f]{6}/g.test(message.args[1])) {
				const role = await message.guild.roles.create({ name: message.args[0], reason: `Created by ${message.author.tag}`, color: colourNames[colour] ?? message.args[1], hoist: message.args[2] ?? false });
				message.channel.success('moderation/addrole:SUCCESS', { ROLE: role.id }).then(m => m.timedDelete({ timeout: 5000 }));
			} else {
				const role = await message.guild.roles.create({ name: message.args[0], reason: `Created by ${message.author.tag}`, hoist: message.args[2] ?? false });
				message.channel.success('moderation/addrole:SUCCESS', { ROLE: role.id }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			name = args.get('name').value,
			color = args.get('colour').value,
			hoist = args.get('hoist').value;

		// Make sure there isn't already the max number of roles in the guilds
		if (guild.roles.cache.size == 250) return interaction.reply({ embeds: [channel.success('moderation/addrole:MAX_ROLES', {}, true)], fetchReply:true }).then(m => m.timedDelete({ timeout: 5000 }));

		try {
			const role = await guild.roles.create({ name: name, reason: `Created by ${interaction.user.tag}`, color, hoist });
			interaction.channel.success('moderation/addrole:SUCCESS', { ROLE: role.id }).then(m => m.timedDelete({ timeout: 5000 }));
		} catch (err) {
			bot.logger.error(`Command: 'addrole' has error: ${err}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = AddRole;
