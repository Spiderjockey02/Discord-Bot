// Dependencies
const { Embed } = require('../../utils'),
	dateFormat = require('dateformat'),
	Event = require('../../structures/Event');

module.exports = class inviteCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, invite) {
		// Get server settings / if no settings then return
		const settings = invite.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents.includes('INVITECREATE') && settings.ModLog) {
			const embed = new Embed(bot, invite.guild)
				.setDescription([
					`Invite created ${invite.channel ? `in channel: ${invite.channel}` : ''}`,
					`Code: \`${invite.code}\`.`,
					`Max uses: \`${invite.maxUses}\`.`,
					`Runs out: \`${invite.maxAge != 0 ? dateFormat(new Date() + invite.maxAge, 'ddd dd/mm/yyyy') : 'never'}\`.`,
					`Temporary: \`${invite.temporary}\``,
				].join('\n'))
				.setColor(3066993)
				.setFooter(`ID: ${invite.inviter.id}`)
				.setAuthor('Invite created:', invite.inviter.displayAvatarURL())
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${invite.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == invite.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
