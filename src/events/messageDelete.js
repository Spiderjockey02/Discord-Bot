// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ ReactionRoleSchema } = require('../database/models'),
	Event = require('../structures/Event');

module.exports = class messageDelete extends Event {
	async run(bot, message) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message has been deleted${!message.guild ? '' : ` in guild: ${message.guild.id}`}.`);

		// fetch the message if it's a partial
		if (message.partial) await message.fetch();

		// Make sure the message wasn't deleted in a Dm channel
		if (message.channel.type == 'dm') return;

		// Check if message that was deleted was a reaction role embed
		await ReactionRoleSchema.findOneAndRemove({
			guildID: message.guild.id,
			messageID: message.id,
		});

		// If someone leaves the server and the server has default discord messages, it gets removed but says message content is null (Don't know why)
		if (!message.content) return;

		// Make sure its not the bot
		if (message.author.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if ModLog plugin is active
		if (settings.ModLog == false || message.content.startsWith(settings.prefix)) return;

		// Check if event messageDelete is for logging
		if (settings.ModLogEvents.includes('MESSAGEDELETE')) {
			// shorten message if it's longer then 1024
			let shortened = false;
			let content = message.content;
			if (content.length > 1024) {
				content = content.slice(0, 1020) + '...';
				shortened = true;
			}

			// Basic message construct
			const embed = new MessageEmbed()
				.setDescription(`**Message from ${message.author.toString()} deleted in ${message.channel.toString()}**`)
				.setColor(15158332)
				.setFooter(`Author: ${message.author.id} | Message: ${message.id}`)
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.addField(`Content ${shortened ? ' (shortened)' : ''}:`, `${message.content.length > 0 ? content : '*no content*'}`)
				.setTimestamp();
			// check for attachment deletion
			if (message.attachments.size > 0) {
				let attachments = '';
				for (const attachment of message.attachments) {
					attachments += attachment[1].url + '\n';
					embed.fields.push({
						'name': 'Attachments',
						'value': attachments,
					});
				}
			}

			// Find channel and send message
			const modChannel = message.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) bot.addEmbed(modChannel.id, embed);
		}
	}
};
