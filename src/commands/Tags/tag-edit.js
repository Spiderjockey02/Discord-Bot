// Dependencies
const	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

module.exports = class TagEdit extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tag-edit',
			dirname: __dirname,
			aliases: ['t-edit'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit a tag from this server',
			usage: 'tag-edit <rename / edit> <name> <newName / newResponse>',
			cooldown: 2000,
			examples: ['tag-edit rename java Java', 'tag-edit edit java Java is cool'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// make sure member has MANAGE_GUILD permissions
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// make sure something was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// Get user options
		let responseString;
		if (message.args[0].toLowerCase() == 'rename') {
			// edit the tag with the new name
			responseString = message.args.slice(2).join(' ');
			if (!message.args[1]) return message.channel.send('Please specify a name for the tag.');
			if (!message.args[2]) return message.channel.send('Please specify a new name for the tag');
			try {
				await TagsSchema.findOneAndUpdate({ guildID: message.guild.id, name: message.args[1] }, { name: message.args[2] }).then(() => {
					message.channel.send(`Updated tag with the new name: \`${message.args[2]}\`.`);
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			}
		} else if (message.args[0].toLowerCase() == 'edit') {
			// edit the tag with the new response
			responseString = message.args.slice(2).join(' ');
			if (!message.args[1]) return message.channel.send('Please specify a name for the tag.');
			if (!responseString) return message.channel.send('Please specify the new response for the tag');
			try {
				await TagsSchema.findOneAndUpdate({ guildID: message.guild.id, name: message.args[1] }, { response: responseString }).then(() => {
					message.channel.send(`Updated tag with the new response of: \`${message.args[2]}\`.`);
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			}
		} else {
			message.channel.send('Not an option');
		}
	}
};
