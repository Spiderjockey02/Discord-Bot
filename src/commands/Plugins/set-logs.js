// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

// List of events
const features = ['CHANNELCREATE', 'CHANNELDELETE', 'CHANNELUPDATE', 'EMOJICREATE', 'EMOJIDELETE', 'EMOJIUPDATE',
	'GUILDBANADD', 'GUILDBANREMOVE', 'GUILDMEMBERADD', 'GUILDMEMBERREMOVE', 'GUILDMEMBERUPDATE', 'GUILDUPDATE', 'MESSAGEDELETE',
	'MESSAGEDELETEBULK', 'MESSAGEREACTIONADD', 'MESSAGEREACTIONREMOVE', 'MESSAGEREACTIONREMOVEALL', 'MESSAGEUPDATE', 'ROLECREATE', 'ROLEDELETE', 'ROLEUPDATE',
	'VOICESTATEUPDATE', 'REPORT', 'WARNING', 'TICKET', 'INVITECREATE', 'INVITEDELETE'];

module.exports = class SetLog extends Command {
	constructor(bot) {
		super(bot, {
			name: 'set-logs',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setlogs'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Update the log plugin.',
			usage: 'set-logs <option> [data]',
			cooldown: 5000,
			examples: ['set-logs channel 761612724370931722', 'set-logs add CHANNELCREATE'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		if (message.args[0] == 'true' || message.args[0] == 'false') {

			// Enabled/Disable ModLogs
			try {
				await message.guild.updateGuild({ ModLog: message.args[0] });
				settings.ModLog = message.args[0];
				message.channel.success('plugins/set-logs:TOGGLE', { TOGGLE: message.args[0] }).then(m => m.delete({ timeout:10000 }));
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else if (message.args[0] == 'add' || message.args[0] == 'remove') {
			const currentFeatures = settings.ModLogEvents;
			if (!message.args[1] || !features.includes(message.args[1].toUpperCase())) {
				// show logs
				const embed = new Embed(bot, message.guild)
					.setTitle('plugins/set-logs:TITLE')
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('plugins/set-logs:DESC', { FEAT: features.join('`, `'), CUR_FEAT: currentFeatures.join('`, `') }));
				message.channel.send(embed).then(m => m.delete({ timeout: 15000 }));
			} else if (message.args[0] == 'add') {

				// add new Logging
				try {
					message.args.shift();
					const events = message.args.filter(arg => currentFeatures.indexOf(arg.toUpperCase()) == -1);
					currentFeatures.push(...events);
					await message.guild.updateGuild({ ModLogEvents: currentFeatures });
					settings.ModLogEvents = currentFeatures;
					message.channel.success('plugins/set-logs:ADD_LOG', { LOG: `\`${events ? events.join('`, `') : 'Nothing'}\`` });
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				}
			} else if (message.args[0] == 'remove') {

				// remove features
				try {
					for (let i = 0; i < message.args.length; i++) {
						if (currentFeatures.indexOf(message.args[i].toUpperCase()) > -1) {
							currentFeatures.splice(currentFeatures.indexOf(message.args[i].toUpperCase()), 1);
						}
					}

					await message.guild.updateGuild({ ModLogEvents: currentFeatures });
					settings.ModLogEvents = currentFeatures;
					message.channel.success('plugins/set-logs:ADD_LOG', { LOG: `\`${message.args.splice(1, message.args.length).join(' ').toUpperCase().join('`, `')}\`` });
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				}
			}
		} else if (message.args[0] == 'channel') {
			try {
				const channelID = (message.guild.channels.cache.get(message.args[1])) ? message.guild.channels.cache.get(message.args[1]).id : message.channel.id;
				await message.guild.updateGuild({ ModLogChannel: channelID });
				settings.ModLogChannel = channelID;
				message.channel.success('plugins/set-logs:CHANNEL', { ID: channelID });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		} else if (message.args[0] == 'list') {
			const embed = new Embed(bot, message.guild)
				.setTitle('plugins/set-logs:TITLE_2')
				.setDescription(message.translate('plugins/set-logs:DESC', { ID: settings.ModLogChannel, TOGGLE: settings.ModLog, FEAT: settings.ModLogEvents.join('`, `') }));
			message.channel.send(embed);
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
			message.channel.send(embed);
		}
	}
};
