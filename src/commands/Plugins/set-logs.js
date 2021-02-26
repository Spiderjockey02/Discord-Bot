// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

// Lis of events
const features = ['CHANNELCREATE', 'CHANNELDELETE', 'CHANNELUPDATE', 'EMOJICREATE', 'EMOJIDELETE', 'EMOJIUPDATE', 'GUILDBANADD', 'GUILDBANREMOVE', 'GUILDMEMBERADD', 'GUILDMEMBERREMOVE', 'GUILDMEMBERUPDATE', 'GUILDUPDATE', 'MESSAGEDELETE', 'MESSAGEDELETEBULK', 'MESSAGEREACTIONADD', 'MESSAGEREACTIONREMOVE', 'ROLECREATE', 'ROLEDELETE', 'ROLEUPDATE'];

module.exports = class SetLog extends Command {
	constructor(bot) {
		super(bot, {
			name: 'set-logs',
			dirname: __dirname,
			aliases: ['setlogs'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Update the log plugin.',
			usage: 'set-logs <add | removed> [log]',
			cooldown: 5000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		if (!args[0]) {
			const embed = new MessageEmbed()
				.setTitle('Logging plugin')
				.setColor(message.member.displayHexColor)
				.setDescription(`\`${settings.prefix}set-logs <true | false>\`\n\`${settings.prefix}set-logs channel <ChannelID>\`\n\`${settings.prefix}set-logs <add | remove> LOG\``);
			message.channel.send(embed);
		} else if (args[0] == 'true' || args[0] == 'false') {
			await message.guild.updateGuild({ ModLog: args[0] });
			message.success(settings.Language, 'PLUGINS/LOGS_SET', args[0]).then(m => m.delete({ timeout:10000 }));
		} else if (args[0] == 'add' || args[0] == 'remove') {
			const currentFeatures = settings.ModLogEvents;
			if (!args[1]) {
				// show logs
				const embed = new MessageEmbed()
					.setTitle('Logging features:')
					.setColor(message.member.displayHexColor)
					.setDescription(`Available features: \`${features.join('`, `')}\`.\n\nCurrent features: \`${currentFeatures.join('`, `')}\`.`);
				message.channel.send(embed);
			} else if (args[0] == 'add') {
				currentFeatures.push(args[1].toUpperCase());
				await message.guild.updateGuild({ ModLogEvents: currentFeatures });
				message.channel.send(`Added: ${args[1].toUpperCase()} to logging.`);
			} else if (args[0] == 'remove') {
				// remove features
				if (currentFeatures.indexOf(args[1].toUpperCase()) > -1) {
					currentFeatures.splice(currentFeatures.indexOf(args[1].toUpperCase()), 1);
				}
				await message.guild.updateGuild({ ModLogEvents: currentFeatures });
				message.channel.send(`Removed: ${args[1].toUpperCase()} from logging.`);
			} else {
				// incorrect entry
			}
		} else if (args[0] == 'channel') {
			try {
				const channelID = (message.guild.channels.cache.find(channel => channel.id == args[1])) ? message.guild.channels.cache.find(channel => channel.id == args[1]).id : message.channel.id;
				if (channelID) {
					await message.guild.updateGuild({ ModLogChannel: channelID });
					message.success(settings.Language, 'PLUGINS/LOG_CHANNEL', channelID);
				}
			} catch (err) {
				bot.logger.error(err);
			}
		} else {
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
