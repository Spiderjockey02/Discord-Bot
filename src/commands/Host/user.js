// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ userSchema } = require('../../database/models'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class UserData extends Command {
	constructor(bot) {
		super(bot, {
			name: 'user',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit a user\'s data',
			usage: 'user <id> [premium / banned] [true / false]',
			cooldown: 3000,
			examples: ['user 184376969016639488 premium true'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		let user;
		try {
			user = await bot.users.fetch(message.args[0]);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('Invalid user ID.').then(m => m.timedDelete({ timeout: 5000 }));
		}
		if (!user) return;

		// Display user information
		if (!message.args[1]) {
			const embed = new MessageEmbed()
				.setTitle('User Information:')
				.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024 }))
				.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
				.setDescription([
					`Username: \`${user.tag}\``,
					`ID: \`${user.id}\``,
					`Creation Date: \`${moment(user.createdAt).format('lll')}\``,
					'',
					`Premium: \`${user.premium}\``,
					`Is banned: \`${user.cmdBanned}\``,
					`No. of mutual servers: \`${bot.guilds.cache.filter(g => g.members.cache.get(user.id)).size}\``,
				].join('\n'));
			return message.channel.send({ embeds: [embed] });
		} else if (message.args[1].toLowerCase() === 'premium') {
			// Update the user's premium
			try {
				if (!['true', 'false'].includes(message.args[2].toLowerCase())) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/user:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
				const resp = await userSchema.findOne({ userID: user.id	});
				if (!resp) {
					await (new userSchema({
						userID: user.id,
						premium: message.args[2],
					})).save();
				} else {
					await userSchema.findOneAndUpdate({ userID: user.id }, { premium: message.args[2] });
				}
				user.premium = message.args[2];
				message.channel.success('host/user:SUCCESS_PREM').then(m => m.timedDelete({ timeout: 10000 }));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else if (message.args[1].toLowerCase() == 'banned') {
			// Update the user's global ban
			try {
				if (!['true', 'false'].includes(message.args[2].toLowerCase())) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/user:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
				const resp = await userSchema.findOne({ userID: user.id	});
				if (!resp) {
					await (new userSchema({
						userID: user.id,
						cmdBanned: message.args[2],
					})).save();
				} else {
					await userSchema.findOneAndUpdate({ userID: user.id }, { cmdBanned: message.args[2] });
				}
				user.cmdBanned = message.args[2];
				message.channel.success('host/user:SUCCESS_BAN').then(m => m.timedDelete({ timeout: 10000 }));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/user:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
};
