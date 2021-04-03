// Dependencies
const { MessageEmbed } = require('discord.js');
const { ReactionRoleSchema } = require('../database/models');

module.exports = async (bot, reaction, user) => {
	// For debugging
	if (bot.config.debug) bot.logger.debug(`Message reaction added${!reaction.message.guild ? '' : ` in guild: ${reaction.message.guild.id}`}`);

	// Make sure it's not a BOT and in a guild
	if (user.bot) return;
	if (!reaction.message.guild) return;

	// If reaction needs to be fetched
	if (reaction.message.partial) await reaction.message.fetch();
	if (reaction.partial) await reaction.fetch();

	// Get server settings / if no settings then return
	const settings = reaction.message.channel.guild.settings;
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
		const modChannel = reaction.message.channel.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
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
	const rreaction = dbReaction.reactions.find(r => r.emoji === (reaction.emoji.id) ? reaction.emoji.id : reaction.emoji.name);
	if (!rreaction) return;

	// Add or remove role depending if they have it or not
	if (!member.roles.cache.has(rreaction.roleID)) {
		member.roles.add(rreaction.roleID);
	} else {
		member.roles.remove(rreaction.roleID);
	}
};
