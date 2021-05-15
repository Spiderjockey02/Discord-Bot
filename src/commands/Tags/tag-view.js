// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

module.exports = class TagView extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tag-view',
			dirname: __dirname,
			aliases: ['t-view'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'View the server\'s tag(s)',
			usage: 'tag-view [name]',
			cooldown: 2000,
			examples: ['tag-view'],
		});
	}

	// Run command
	async run(bot, message) {
		// view all tags on the server
		TagsSchema.find({ guildID: message.guild.id }).then(result => {
			// if no tags have been saved yet
			if (!result[0]) return message.channel.send('No tags saved');

			// check if an input was entered
			if (message.args[0]) {
				for (let i = 0; i < result.length; i++) {
				// tagName alreaddy exists
					if (result[i].name == message.args[0]) {
						return message.channel.send(result[i].response);
					}
				}
			}

			// if no input was entered or tagName didn't match
			if (result != null) {
				const resultEmbed = new MessageEmbed()
					.setTitle('List of tags for: ' + message.guild.name);

				result.forEach(function(value) {
					resultEmbed.addField(`Name: ${value.name}`, `Respones: ${value.response}`);
				});
				return message.channel.send(resultEmbed);
			} else {
				return message.channel.send('There are no existing tags.');
			}
		});
	}
};
