// Dependencies
const fs = require('fs'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Editrole command
 * @extends {Command}
*/
class EditRole extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'editrole',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['modifyrole'],
			userPermissions: [Flags.ManageRoles],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageRoles],
			description: 'Edit a role\'s data in the server',
			usage: 'editrole <role name> <option> <value>',
			cooldown: 5000,
			examples: ['editrole Yellow colour yellow'],
			slash: false,
			options: [
				{
					name: 'role',
					description: 'The role to edit.',
					type: ApplicationCommandOptionType.Role,
					required: true,
				},
				{
					name: 'key',
					description: 'The key to edit.',
					type: ApplicationCommandOptionType.String,
					choices: [...['name', 'colour', 'hoist'].map(i => ({ name: i, value: i }))],
					required: true,
				},
				{
					name: 'value',
					description: 'The value to edit.',
					type: ApplicationCommandOptionType.String,
					maxLength: 100,
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

		// make sure a role name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/editrole:USAGE')) });

		// find role based on mention, ID or name
		const role = message.getRole();

		// No role was found
		if (!role[0]) return message.channel.error('moderation/delrole:MISSING');

		if (message.member.permissions.has(Flags.Administrator) || role[0].comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
			switch (message.args[1].toLowerCase()) {
				case 'colour':
				case 'color':
					fs.readFile('./src/assets/json/colours.json', async (err, data) => {
						if (err) {
							bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
							return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
						}

						// Retrieve the names of colours
						const { colourNames } = JSON.parse(data);
						const colour = (message.args[2].toLowerCase()).replace(/\s/g, '');
						if (colourNames[colour] ?? /[0-9A-Fa-f]{6}/g.test(message.args[2])) {
							role[0].edit({ color: colourNames[colour] ?? message.args[2] });
							message.channel.success('moderation/editrole:SUCCESS').then(m => m.timedDelete({ timeout: 3000 }));
						} else {
							return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Colour not found' });
						}
					});
					break;
				case 'hoist':
					if (!['true', 'false'].includes(message.args[2])) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Please provide the boolean as a value' });
					role[0].edit({ hoist: message.args[2] });
					message.channel.success('moderation/editrole:SUCCESS').then(m => m.timedDelete({ timeout: 3000 }));
					break;
				case 'name':
				case 'rename':
					if (message.args[2].length >= 100) return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'The role name is greater than the character limit of (100)' });
					role[0].edit({ name: message.args[2] });
					message.channel.success('moderation/editrole:SUCCESS').then(m => m.timedDelete({ timeout: 3000 }));
					break;
				default:
					message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/editrole:USAGE')) });
			}
		}
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
		const role = guild.roles.cache.get(args.get('role').value),
			channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id),
			{ settings } = guild,
			key = args.get('key').value,
			value = args.get('value').value;

		if (member.permissions.has(Flags.Administrator) || role.comparePositionTo(guild.members.me.roles.highest) >= 0) {
			switch (key) {
				case 'colour':
				case 'color':
					fs.readFile('./src/assets/json/colours.json', async (err, data) => {
						if (err) {
							bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
							return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
						}

						// Retrieve the names of colours
						const { colourNames } = JSON.parse(data);
						const colour = (value).replace(/\s/g, '');
						if (colourNames[colour] ?? /[0-9A-Fa-f]{6}/g.test(value)) {
							await role.edit({ color: colourNames[colour] ?? value });
							interaction.reply({ embeds: [channel.error('moderation/editrole:SUCCESS', null, true)] });
						} else {
							return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Colour not found' }, true)] });
						}
					});
					break;
				case 'hoist':
					if (!['true', 'false'].includes(value)) return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Please provide the boolean as a value' }, true)] });
					await role.edit({ hoist: value });
					interaction.reply({ embeds: [channel.success('moderation/editrole:SUCCESS', null, true)] });
					break;
				case 'name':
				case 'rename':
					if (value.length >= 100) return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'The role name is greater than the character limit of (100)' }, true)] });
					await role.edit({ name: value });
					interaction.reply({ embeds: [channel.success('moderation/editrole:SUCCESS', null, true)] });
					break;
				default:
					interaction.reply({ embeds: [channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(guild.translate('moderation/editrole:USAGE')) }, true)] });
			}
		}
	}
}

module.exports = EditRole;
