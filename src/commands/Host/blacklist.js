// Dependencies
const { GlobalBanSchema } = require('../../database/models'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Blacklist extends Command {
	constructor(bot) {
		super(bot, {
			name: 'blacklist',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Update global ban list',
			usage: 'blacklist <add / remove> <userID> [reason]',
			cooldown: 3000,
			examples: ['blacklist 304990401373143040 commands abusing command'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// make sure something was entered
		if (!message.args[0] || !['add', 'remove'].includes(message.args[0])) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/blacklist:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// get user
		// eslint-disable-next-line no-empty-function
		const user = await bot.users.fetch(message.args[1]).catch(() => {});
		if (!user) return message.channel.error('host/blacklist:MISSING_USER');

		// get reason
		const reason = message.args[2] ? message.args.splice(2, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// update database
		if (message.args[0] == 'add') {
			GlobalBanSchema.findOne({
				userID: user.id,
			}, async (err, res) => {
				// if an error occured
				if (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
				}

				// This is their first warning
				if (!res) {
					try {
						await (new GlobalBanSchema({
							userID: user.id,
							reason: reason,
							IssueDate: new Date().toUTCString(),
						})).save();
						const embed = new Embed(bot, message.guild)
							.setColor(15158332)
							.setAuthor(message.translate('host/blacklist:AUTHOR', { TAG: user.tag }))
							.setDescription(message.translate('host/blacklist:DESC', { REASON: reason }));
						message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));
					} catch (err) {
						if (message.deletable) message.delete();
						bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
						message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
					}
				} else {
					message.channel.send('host/blacklist:ALRDY_BAN', { ID: user.id });
				}
			});
		} else if (message.args[0] == 'remove') {
			await GlobalBanSchema.findOneAndRemove({ userID: user.id });
			message.channel.success('host/blacklist:SUCC_UNBAN');
		}
	}
};
