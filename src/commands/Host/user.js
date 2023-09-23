// Dependencies
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js'),
	{ userSchema } = require('../../database/models'),
	moment = require('moment'),
	axios = require('axios'),
	Command = require('../../structures/Command.js');

/**
 * User command
 * @extends {Command}
*/
class User extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'user',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Edit a user\'s data',
			usage: 'user <id> [premium / banned / rank / reset] [true / false]',
			cooldown: 3000,
			examples: ['user 184376969016639488 premium true'],
			slash: true,
			options: bot.subCommands.filter(c => c.help.name.startsWith('user-')).map(c => ({
				name: c.help.name.replace('user-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
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
		let user;
		try {
			user = await bot.users.fetch(message.args[0]);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('Invalid user ID.');
		}
		if (!user) return;

		// Display user information
		if (!message.args[1]) {
			const embed = new EmbedBuilder()
				.setTitle('User Information:')
				.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
				.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
				.setDescription([
					`Username: \`${user.displayName}\``,
					`ID: \`${user.id}\``,
					`Creation Date: \`${moment(user.createdAt).format('lll')}\``,
					'',
					`Premium: \`${user.premium}\`${user.premium ? ` (${(new Date(parseInt(user.premiumSince)).toLocaleString()).split(',')[0]})` : ''}.`,
					`Is banned: \`${user.cmdBanned}\``,
					`No. of mutual servers: \`${bot.guilds.cache.filter(g => g.members.cache.get(user.id)).size}\``,
				].join('\n'));
			return message.channel.send({ embeds: [embed] });
		}

		// find input
		switch (message.args[1].toLowerCase()) {
			case 'premium':
			// Update the user's premium
				try {
					if (!['true', 'false'].includes(message.args[2].toLowerCase())) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/user:USAGE')) });
					const resp = await userSchema.findOne({ userID: user.id	});
					if (!resp) {
						await (new userSchema({
							userID: user.id,
							premium: message.args[2],
							premiumSince: Date.now(),
						})).save();
					} else {
						await userSchema.findOneAndUpdate({ userID: user.id }, { premium: message.args[2], premiumSince: Date.now() });
					}
					user.premium = message.args[2];
					message.channel.success('host/user:SUCCESS_PREM').then(m => m.timedDelete({ timeout: 10000 }));
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
				break;
			case 'banned':
			// Update the user's global ban
				try {
					if (!['true', 'false'].includes(message.args[2].toLowerCase())) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/user:USAGE')) });
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
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
				break;
			case 'rank':
			// Update user's rank card
				if (message.attachments.first().url) {
					try {
						const response = await axios.get(message.attachments.first().url, { responseType: 'arraybuffer' });
						if (!['png', 'jpeg'].includes(response.headers['content-type'].replace('image/', ''))) return message.channel.error(`File type must be \`PNG\` or \`JPEG\`, this file type was: ${response.headers['content-type'].replace('image/', '')}`);
						const resp = await userSchema.findOne({ userID: user.id	});
						if (!resp) {
							await (new userSchema({
								userID: user.id,
								rankImage: Buffer.from(response.data, 'utf-8'),
							})).save();
						} else {
							await userSchema.findOneAndUpdate({ userID: user.id }, { rankImage: Buffer.from(response.data, 'utf-8') });
						}
						user.rankImage = Buffer.from(response.data, 'utf-8');
						message.channel.success('host/user:SUCCESS_RANK').then(m => m.timedDelete({ timeout: 10000 }));
					} catch (err) {
						if (message.deletable) message.delete();
						bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
						message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
					}
				} else {
					return message.channel.error('Please upload either a PNG or JPEG file with the command.');
				}
				break;
			case 'reset':
				try {
					await userSchema.findOneAndRemove({ userID: user.id });
					user.premium = false;
					user.cmdBanned = false;
					user.rankImage = '';
					message.channel.success('host/user:SUCCESS_RESET').then(m => m.timedDelete({ timeout: 10000 }));
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
				break;
			default:
				message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/user:USAGE')) });
				break;
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const command = bot.subCommands.get(`user-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

module.exports = User;
