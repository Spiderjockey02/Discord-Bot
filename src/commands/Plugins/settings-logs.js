// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

// List of events
const features = ['CHANNELCREATE', 'CHANNELDELETE', 'CHANNELUPDATE', 'EMOJICREATE', 'EMOJIDELETE', 'EMOJIUPDATE',
	'GUILDBANADD', 'GUILDBANREMOVE', 'GUILDMEMBERADD', 'GUILDMEMBERREMOVE', 'GUILDMEMBERUPDATE', 'EVENTCREATE', 'EVENTDELETE',
	'EVENTUPDATE', 'EVENTUSERADD', 'EVENTUSERREMOVE', 'GUILDUPDATE', 'MESSAGEDELETE', 'MESSAGEDELETEBULK', 'MESSAGEREACTIONADD',
	'MESSAGEREACTIONREMOVE', 'MESSAGEREACTIONREMOVEALL', 'MESSAGEUPDATE', 'ROLECREATE', 'ROLEDELETE', 'ROLEUPDATE', 'VOICESTATEUPDATE',
	'REPORT', 'WARNING', 'TICKET', 'INVITECREATE', 'INVITEDELETE', 'THREADCREATE', 'THREADDELETE', 'THREADUPDATE', 'THREADMEMBERSUPDATE',
	'STICKERCREATE', 'STICKERDELETE', 'STICKERUPDATE'];

/**
 * Set logs command
 * @extends {Command}
*/
class SetLog extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'settings-logs',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setlogs'],
			userPermissions: [Flags.ManageGuild],
			description: 'Update the log plugin.',
			usage: 'set-logs <option> [data]',
			cooldown: 5000,
			examples: ['set-logs channel 761612724370931722', 'set-logs add CHANNELCREATE'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'toggle',
					description: 'Enable or disable the logs',
					type: ApplicationCommandOptionType.Boolean,
					required: false,
				},
				{
					name: 'channel',
					description: 'Set the channel',
					type: ApplicationCommandOptionType.Channel,
					channelTypes: [ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNews],
					required: false,
				},
				{
					name: 'add',
					description: 'Add a event to listen to',
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: false,
				},
				{
					name: 'remove',
					description: 'Remove a event to listen to',
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: false,
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

		if (message.args[0] == 'true' || message.args[0] == 'false') {

			// Enabled/Disable ModLogs
			try {
				await message.guild.updateGuild({ ModLog: message.args[0] });
				message.channel.success('plugins/set-logs:TOGGLE', { TOGGLE: message.args[0] });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else if (message.args[0] == 'add' || message.args[0] == 'remove') {
			const currentFeatures = settings.ModLogEvents ?? [];
			if (!message.args[1] || !features.includes(message.args[1].toUpperCase())) {
				// show logs
				const embed = new Embed(bot, message.guild)
					.setTitle('plugins/set-logs:TITLE')
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('plugins/set-logs:DESC', { FEAT: features.join('`, `'), CUR_FEAT: currentFeatures.join('`, `') }));
				message.channel.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
			} else if (message.args[0] == 'add') {

				// add new Logging
				try {
					message.args.shift();
					const events = message.args.map(args => args.toUpperCase()).filter(arg => currentFeatures.indexOf(arg.toUpperCase()) == -1);
					currentFeatures.push(...events);
					await message.guild.updateGuild({ ModLogEvents: currentFeatures });
					message.channel.success('plugins/set-logs:ADD_LOG', { LOG: `\`${events[0] ? events.join('`, `') : 'Nothing'}\`` });
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
			} else if (message.args[0] == 'remove') {

				// remove features
				try {
					for (const featues of message.args.map(args => args.toUpperCase())) {
						if (currentFeatures.indexOf(featues.toUpperCase()) > -1) currentFeatures.splice(currentFeatures.indexOf(featues.toUpperCase()), 1);
					}

					await message.guild.updateGuild({ ModLogEvents: currentFeatures });
					message.channel.success('plugins/set-logs:REMOVED', { LOG: `\`${message.args.splice(1, message.args.length).join(' ').toUpperCase()}\`` });
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
			}
		} else if (message.args[0] == 'channel') {
			try {
				const channelID = message.getChannel();
				await message.guild.updateGuild({ ModLogChannel: channelID[0].id });
				message.channel.success('plugins/set-logs:CHANNEL', { ID: channelID[0].id });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else if (message.args[0] == 'list') {
			const embed = new Embed(bot, message.guild)
				.setTitle('plugins/set-logs:TITLE_2')
				.setDescription(message.translate('plugins/set-logs:DESC_2', { ID: settings.ModLogChannel, TOGGLE: settings.ModLog, FEAT: settings.ModLogEvents.join('`, `') }));
			message.channel.send({ embeds: [embed] });
		} else {
			// if nothing was entered
			const embed = new Embed(bot, message.guild)
				.setTitle('Logging plugin')
				.setColor(message.member.displayHexColor)
				.setDescription([
					`\`${settings.prefix}set-logs <true | false>\``,
					`\`${settings.prefix}set-logs channel <ChannelID>\``,
					`\`${settings.prefix}set-logs <add | remove> LOG\``,
					`\`${settings.prefix}set-logs list\``,
				].join('\n'));
			message.channel.send({ embeds: [embed] });
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
		const toggle = args.get('toggle')?.value,
			channel = guild.channels.cache.get(args.get('channel')?.value),
			add = args.get('add')?.value,
			remove = args.get('remove')?.value;

		const updatedFeatures = [];
		// Update toggle
		if (toggle != undefined) {
			updatedFeatures.push(`Logging: ${toggle ? 'enabled' : 'disabled'}`);
			await guild.updateGuild({ ModLog: toggle });
		}

		// Update channel
		if (channel != undefined) {
			updatedFeatures.push(`Channel: ${channel}`);
			await guild.updateGuild({ ModLogChannel: channel });
		}

		// Add to the log events array
		if (add != undefined) {
			const events = guild.settings.ModLogEvents;
			// Check if it's already included
			if (features.includes(remove)) {
				events.push(add);
				updatedFeatures.push(`Added ${add} to the logs`);
				await guild.updateGuild({ ModLogEvents: events });
			} else {
				updatedFeatures.push(`${add} was an invalid event`);
			}
		}

		// Remove to the log events array
		if (remove != undefined) {
			if (guild.settings.ModLogEvents.includes(remove)) {
				const events = guild.settings.ModLogEvents.filter(l => l !== remove);
				updatedFeatures.push(`Removed ${remove} from the logs`);
				await guild.updateGuild({ ModLogEvents: events });
			} else {
				updatedFeatures.push(`${remove} was an invalid event`);
			}
		}

		interaction.reply({ content: `Updated the following:\n- ${updatedFeatures.join('\n- ')}` });
	}

	/**
	  * Function for handling autocomplete
	  * @param {bot} bot The instantiating client
	  * @param {interaction} interaction The interaction that ran the command
	  * @readonly
	*/
	autocomplete(bot, interaction) {
		const option = interaction.options.getFocused(true);
		let events = [];

		// Get the list of events based on subcommand
		if (option.name == 'add') {
			events = features.filter(f => !interaction.member.guild.settings.ModLogEvents.includes(f));
		} else {
			// They are trying to remove an existing event
			events = interaction.member.guild.settings.ModLogEvents;
		}

		// Filter the events based on input
		events = events.filter(i => i.toLowerCase().startsWith(option.value.toLowerCase())).slice(0, 10);

		// Send back the responses
		interaction.respond(events.map(i => ({ name: i, value: i })));
	}
}

module.exports = SetLog;
