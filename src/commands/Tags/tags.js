// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Tags extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tags',
			dirname: __dirname,
			aliases: ['modifytags', 'tag'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit server\'s tags',
			usage: 'tag <add/del/edit/view> <required paramters>',
			cooldown: 5000,
			examples: ['tag add java Download Java here: <https://adoptopenjdk.net/>', 'tag rename java Java'],
		});
	}

	// Run command
	async run(bot, message, settings) {

		// make sure member has MANAGE_GUILD permissions
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// make sure something was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// run subcommands
		const option = message.args[0].toLowerCase();
		message.args.shift();
		switch (option) {
		case 'add':
			await bot.commands.get('tag-add').run(bot, message, settings);
			break;
		case 'delete':
		case 'del':
			await bot.commands.get('tag-delete').run(bot, message, settings);
			break;
		case 'edit':
			await bot.commands.get('tag-edit').run(bot, message, settings);
			break;
		case 'view':
			await bot.commands.get('tag-view').run(bot, message, settings);
			break;
		default:
			// delete message
			if (settings.ModerationClearToggle & message.deletable) message.delete();
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
