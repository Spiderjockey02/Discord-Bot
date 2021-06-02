// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

module.exports = class messageReactionRemove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, reaction, user) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message reaction removed${!reaction.message.guild ? '' : ` in guild: ${reaction.message.guild.id}`}`);

		// Make sure it's not a BOT and in a guild
		if (user.bot) return;
		if (!reaction.message.guild) return;

		// If reaction needs to be fetched
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
		} catch (err) {
			return bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// make sure the message author isn't the bot
		if (reaction.message.author.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionRemove is for logging
		if (settings.ModLogEvents.includes('MESSAGEREACTIONREMOVE') && settings.ModLog) {
			const embed = new Embed(bot, reaction.message.guild)
				.setDescription(`**${user.toString()} unreacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
				.setColor(15158332)
				.setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
				.setAuthor(user.tag, user.displayAvatarURL())
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${reaction.message.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == reaction.message.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
