// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ WarningSchema } = require('../../database/models'),
	Event = require('../../structures/Event');

module.exports = class Warning extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, member, warning) {
		// get settings
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// fetch latest warning to get information
		if (settings.ModLogEvents.includes('WARNING') && settings.ModLog) {

			const warns = await WarningSchema.find({
				userID: member.user.id,
				guildID: member.guild.id,
			});

			// For debugging
			const embed = new MessageEmbed()
				.setColor(15158332);
			if (warns.length == 3) {
				embed.setAuthor(`[KICK] ${member.user.tag}`, member.user.displayAvatarURL());
			} else {
				embed.setAuthor(`[WARN] ${member.user.tag}`, member.user.displayAvatarURL());
			}
			embed.addField('User:', `${member}`, true);
			embed.addField('Moderator:', `${member.guild.members.cache.get(warning.Moderater).user.tag}`, true);
			if (warns.length != 3) {
				embed.addField('Warnings:', `${warns.length}`, true);
			} else {
				embed.addField('Warnings:', '1', true);
			}
			embed.addField('Reason:', warning.Reason);
			embed.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${member.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
