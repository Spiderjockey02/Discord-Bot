// Dependencies
const { Embed } = require('../../utils'),
	{ ReactionRoleSchema, GiveawaySchema, ticketEmbedSchema } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class messageDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, message) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message has been deleted${!message.guild ? '' : ` in guild: ${message.guild.id}`}.`);

		// Make sure the message wasn't deleted in a Dm channel
		if (message.channel.type == 'dm') return;

		// If someone leaves the server and the server has default discord messages, it gets removed but says message content is null (Don't know why)
		if (!message.content && !message.attachments) return;

		// if the message is a partial return
		if (message.partial) return;

		// make sure it wasn't a webhook message
		if (message.webhookID) return;

		// Check if the message was a giveaway/reaction role embed
		try {
			// check reaction roles
			const rr = await ReactionRoleSchema.findOneAndRemove({ messageID: message.id,	channelID: message.channel.id });
			if (rr) bot.logger.log('A reaction role embed was deleted.');

			// check giveaways
			const g = await GiveawaySchema.findOneAndRemove({ messageID: message.id,	channelID: message.channel.id });
			if (g) {
				await bot.giveawaysManager.delete(message.id);
				bot.logger.log('A giveaway embed was deleted.');
			}

			// check ticket embed
			const te = await ticketEmbedSchema.findOneAndRemove({ messageID: message.id,	channelID: message.channel.id });
			if (te) bot.logger.log('A ticket reaction embed was deleted.');
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Make sure its not the bot
		if (message.author.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if ModLog plugin is active
		if (message.content.startsWith(settings.prefix)) return;

		// Check if event messageDelete is for logging
		if (settings.ModLogEvents.includes('MESSAGEDELETE') && settings.ModLog) {
			// shorten message if it's longer then 1024
			let shortened = false;
			let content = message.content;
			if (content.length > 1024) {
				content = content.slice(0, 1020) + '...';
				shortened = true;
			}

			// Basic message construct
			const embed = new Embed(bot, message.guild)
				.setDescription(`**Message from ${message.author.toString()} deleted in ${message.channel.toString()}**`)
				.setColor(15158332)
				.setFooter(`Author: ${message.author.id} | Message: ${message.id}`)
				.setAuthor(message.author.tag, message.author.displayAvatarURL());
			if (message.content.length > 0) embed.addField(`Content ${shortened ? ' (shortened)' : ''}:`, `${content}`);
			embed.setTimestamp();
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
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${message.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == message.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
