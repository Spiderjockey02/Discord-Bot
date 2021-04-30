// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class messageUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, oldMessage, newMessage) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message updated${!newMessage.guild ? '' : ` in guild: ${newMessage.guild.id}`}`);

		// make sure its not a DM
		if (!newMessage.guild) return;

		// Check if message is a partial
		if (oldMessage.partial) await oldMessage.fetch();
		if (newMessage.partial) await newMessage.fetch();

		// only check for message content is different
		if (oldMessage.content == newMessage.content) return;

		// Get server settings / if no settings then return
		const settings = newMessage.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelDelete is for logging
		if (settings.ModLogEvents.includes('MESSAGEUPDATE') && settings.ModLog) {
			// shorten both messages when the content is larger then 1024 chars
			let oldShortened = false;
			let oldContent = oldMessage.content;
			if (oldContent.length > 1024) {
				oldContent = oldContent.slice(0, 1020) + '...';
				oldShortened = true;
			}
			let newShortened = false;
			let newContent = newMessage.content;
			if (newContent.length > 1024) {
				newContent = newContent.slice(0, 1020) + '...';
				newShortened = true;
			}
			const embed = new MessageEmbed()
				.setDescription(`**Message of ${newMessage.author.toString()} edited in ${newMessage.channel.toString()}** [Jump to Message](${newMessage.url})`)
				.setFooter(`Author: ${newMessage.author.id} | Message: ${newMessage.id}`)
				.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL())
				.addFields(
					{ name: `Before ${(oldShortened ? ' (shortened)' : '')}:`, value: `${oldMessage.content.length > 0 ? oldContent : '*empty message*'}`, inline: true },
					{ name: `After ${(newShortened ? ' (shortened)' : '')}:`, value: `${newMessage.content.length > 0 ? newContent : '*empty message*'}`, inline: true })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newMessage.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == newMessage.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
