// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ ReactionRoleSchema } = require('../database/models'),
	Event = require('../structures/Event');

module.exports = class messageReactionAdd extends Event {
	async run(bot, reaction, user) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Message reaction added${!reaction.message.guild ? '' : ` in guild: ${reaction.message.guild.id}`}`);

		// Make sure it's not a BOT and in a guild
		if (user.bot) return;
		if (!reaction.message.guild) return;

		// If reaction needs to be fetched
		if (reaction.message.partial) await reaction.message.fetch();
		if (reaction.partial) await reaction.fetch();

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageReactionAdd is for logging
		if (settings.ModLogEvents.includes('MESSAGEREACTIONADD') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`**${user.toString()} reacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
				.setColor(3066993)
				.setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
				.setAuthor(user.tag, user.displayAvatarURL())
				.setTimestamp();

			// Find channel and send message
			const modChannel = reaction.message.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}

		const { guild } = reaction.message;
		const member = guild.members.cache.get(user.id);
		if (!member) return;

		// fetch database
		const dbReaction = await ReactionRoleSchema.findOne({
			guildID: guild.id,
			messageID: reaction.message.id,
		});

		// Get role to add/remove to user
		if (!dbReaction) return;
		const rreaction = dbReaction.reactions.find(r => r.emoji === reaction.emoji.toString());
		if (!rreaction) return;

		// Add or remove role depending if they have it or not
		try {
			if (!member.roles.cache.has(rreaction.roleID)) {
				await member.roles.add(rreaction.roleID);
			} else {
				await member.roles.remove(rreaction.roleID);
			}
		} catch (err) {
			const channel = guild.channels.cache.get(dbReaction.channelID);
			if (channel) channel.send(`I am missing permission to give ${member} the role: ${guild.roles.cache.get(rreaction.roleID)}`).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
