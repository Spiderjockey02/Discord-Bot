// Dependecies
const Command = require('../../structures/Command.js'),
	{ ReactionRoleSchema } = require('../../database/models');

module.exports = class ReactionRoleRemove extends Command {
	constructor(bot) {
		super(bot, {
			name: 'rr-remove',
			dirname: __dirname,
			aliases: ['reactionroles-remove', 'rr-delete'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Make reaction roles',
			usage: 'reactionroles <messagelink>',
			cooldown: 5000,
			examples: ['reactionroles https://discord.com/channels/750822670505082971/761619652009787392/837657228055937054'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure user can edit server plugins
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => setTimeout(() => { m.delete(); }, 10000));

		// make sure an arg was sent aswell
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));

		// fetch and validate message
		const patt = /https?:\/\/(?:(?:canary|ptb|www)\.)?discord(?:app)?\.com\/channels\/(?:@me|(?<g>\d+))\/(?<c>\d+)\/(?<m>\d+)/g;
		let msg;
		if (patt.test(message.args[0])) {
			const stuff = message.args[0].split('/');
			try {
				msg = await bot.guilds.cache.get(stuff[4])?.channels.cache.get(stuff[5])?.messages.fetch(stuff[6]);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			}
		} else {
			return message.channel.send('Invalid message link');
		}

		// delete message and then remove database
		try {
			await msg.delete();
			await ReactionRoleSchema.findOneAndRemove({ messageID: msg.id,	channelID: msg.channel.id });
			message.channel.send('Successfully deleted reaction role');
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
