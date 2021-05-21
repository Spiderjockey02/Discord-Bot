// Dependencies
const	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

module.exports = class TagAdd extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tag-add',
			dirname: __dirname,
			aliases: ['t-add', 't-create'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add a new tag to the server',
			usage: 'tag-add <name> <response>',
			cooldown: 2000,
			examples: ['tag-add java Download Java here: <https://adoptopenjdk.net/>'],
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

		try {
			// Validate input
			const responseString = message.args.slice(1).join(' ');
			if (!message.args[0]) return message.channel.send('Please specify a name for the tag.');
			if (!message.args[0].length > 10) return message.channel.send('Please shorten the name of the tag.');
			if (!responseString) return message.channel.send('Please specify a response for the tag');

			// Make sure the tagName doesn't exist and they haven't gone past the tag limit
			TagsSchema.find({ guildID: message.guild.id }).then(async guildTags => {
				if (guildTags.length >= 10 && !message.guild.premium) return message.channel.send('You need premium to create more tags. Premium servers get up to `50` tags');
				if (guildTags.length >= 50) return message.channel.send('You have exceeded the maximium tags.');

				// Make sure the tagName doesn't exist
				for (let i = 0; i < guildTags.length; i++) {
					// tagName alreaddy exists
					if (guildTags[i].name == message.args[0]) {
						return message.channel.send('This tag has already been created.');
					}
				}

				// save tag as name doesn't exists
				await (new TagsSchema({
					guildID: message.guild.id,
					name: message.args[0],
					response: responseString,
				})).save();
				message.channel.send(`Tag has been saved with name: \`${message.args[0]}\`.`);
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
