// Dependencies
const	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

module.exports = class TagDelete extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tag-delete',
			dirname: __dirname,
			aliases: ['t-delete', 't-remove', 'tag-del'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Remove a tag from the server',
			usage: 'tag-delete <name>',
			cooldown: 2000,
			examples: ['tag-delete java'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// make sure member has MANAGE_GUILD permissions
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => setTimeout(() => { m.delete(); }, 10000));

		// make sure something was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// try and delete tag
		try {
			const result = await TagsSchema.findOneAndRemove({ guildID: message.guild.id, name: message.args[0] });
			if (result) {
				message.channel.send(`Tag: ${message.args[0]} was deleted.`);
			} else {
				message.channel.send(`No tag with name: \`${message.args[0]}\` was found.`);
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
