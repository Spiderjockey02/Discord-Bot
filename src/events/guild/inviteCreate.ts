// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Invite create event
 * @event Egglord#InviteCreate
 * @extends {Event}
*/
class InviteCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Invite} invite The invite that was created
	 * @readonly
	*/
	async run(bot, invite) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Invite has been created in ${invite.channel ? `channel: ${invite.channel.id}` : `guild: ${invite.guild.id}`}.`);

		// Get server settings / if no settings then return
		const settings = invite.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents?.includes('INVITECREATE') && settings.ModLog) {
			const embed = new Embed(bot, invite.guild)
				.setDescription([
					`Invite created ${invite.channel ? `in channel: ${invite.channel}` : ''}`,
					`Code: \`${invite.code}\`.`,
					`Max uses: \`${invite.maxUses == 0 ? 'Infinity' : invite.maxUses}\`.`,
					`Runs out: ${invite.maxAge != 0 ? `<t:${Math.round((new Date().getTime() / 1000)) + invite.maxAge}:R>` : 'never'}.`,
					`Temporary: \`${invite.temporary ? 'Yes' : 'No'}\``,
				].join('\n'))
				.setColor(3066993)
				.setFooter({ text: `ID: ${invite.inviter.id}` })
				.setAuthor({ name: 'Invite created:', iconURL: invite.inviter.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${invite.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == invite.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = InviteCreate;
