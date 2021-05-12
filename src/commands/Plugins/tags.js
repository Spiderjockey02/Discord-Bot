// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ TagsSchema } = require('../../database/models/index.js'),
	Command = require('../../structures/Command.js');

module.exports = class Tags extends Command {
	constructor(bot) {
		super(bot, {
			name: 'tags',
			dirname: __dirname,
			aliases: ['modifytags', 'tag'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Toggle plugins on and off',
			usage: 'set-plugin <option>',
			cooldown: 5000,
			examples: ['tag <add/del/edit/rename/view/viewall> <required paramters>'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// make sure member has MANAGE_GUILD permissions
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// make sure something was entered
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// run subcommands
		let responseString;
		switch(message.args[0].toLowerCase()) {
		case 'add':
			try {
				// make sure the correct data was entered
				responseString = message.args.slice(2).join(' ');
				if (!message.args[1]) return message.channel.send('Please specify a name for the tag.');
				if (!message.args[1].length > 10) return message.channel.send('Please shorten the name of the tag.');
				if (!responseString) return message.channel.send('Please specify a response for the tag');

				// Make sure the tagName doesn't exist and they haven't gone past the tag limit
				TagsSchema.find({ guildID: message.guild.id }).then(async guildTags => {
					if (guildTags.length >= 10 && !message.guild.premium) return message.channel.send('You need premium to create more tags. Premium servers get up to `50` tags');
					if (guildTags.length >= 50) return message.channel.send('You have exceeded the maximium tags.');

					// Make sure the tagName doesn't exist
					for (let i = 0; i < guildTags.length; i++) {
						// tagName alreaddy exists
						if (guildTags[i].name == message.args[1]) {
							return message.channel.send('This tag has already been created.');
						}
					}

					// save tag as name doesn't exists
					await (new TagsSchema({
						guildID: message.guild.id,
						name: message.args[1],
						response: responseString,
					})).save();
					message.channel.send(`Tag has been saved with name: \`${message.args[1]}\`.`);
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
			break;
		case 'del':
			// try and delete tag
			try {
				await TagsSchema.findOneAndRemove({ guildID: message.guild.id, name: message.args[1] }).then(() => {
					message.channel.send('Removed tag');
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
			break;
		case 'edit':
			// edit the tag with the new response
			responseString = message.args.slice(2).join(' ');
			if (!message.args[1]) return message.channel.send('Please specify a name for the tag.');
			if (!responseString) return message.channel.send('Please specify the new response for the tag');
			try {
				await TagsSchema.findOneAndUpdate({ guildID: message.guild.id, name: message.args[1] }, { response: responseString }).then(() => {
					message.channel.send(`Updated tag with the new response of: \`${message.args[1]}\`.`);
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
			break;
		case 'rename':
			// edit the tag with the new name
			responseString = message.args.slice(2).join(' ');
			if (!message.args[1]) return message.channel.send('Please specify a name for the tag.');
			if (!message.args[2]) return message.channel.send('Please specify a new name for the tag');
			try {
				await TagsSchema.findOneAndUpdate({ guildID: message.guild.id, name: message.args[1] }, { name: message.args[2] }).then(() => {
					message.channel.send(`Updated tag with the new response of: \`${message.args[1]}\`.`);
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
			break;
		case 'view':
			// see the response from a tag
			if (!message.args[1]) return message.channel.send('Please specify the name of the tag.');
			await TagsSchema.findOne({ guildID: message.guild.id, name: message.args[1] }).then(result => {
				if (result != null) {
					message.channel.send(result.response);
				} else {
					return message.channel.send('There are no tags with this name');
				}
			});
			break;
		case 'viewall':
			// view all tags on the server
			TagsSchema.find({ guildID: message.guild.id }).then(result => {
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
			break;
		default:
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
