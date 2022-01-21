// Dependencies
const { Embed } = require('../../utils'),
	dateFormat = require('dateformat'),
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
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Invite} invite The invite that was created
	 * @readonly
	*/
	async run(bot, invite) {
		// Get server settings / if no settings then return
		const settings = invite.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents?.includes('INVITECREATE') && settings.ModLog) {
			const embed = new Embed(bot, invite.guild)
				.setDescription([
					`Invite created ${invite.channel ? `in channel: ${invite.channel}` : ''}`,
					`Code: \`${invite.code}\`.`,
					`Max uses: \`${invite.maxUses}\`.`,
					`Runs out: \`${invite.maxAge != 0 ? dateFormat(new Date() + invite.maxAge, 'ddd dd/mm/yyyy') : 'never'}\`.`,
					`Temporary: \`${invite.temporary}\``,
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
