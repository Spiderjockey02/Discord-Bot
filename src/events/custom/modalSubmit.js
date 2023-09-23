// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	Event = require('../../structures/Event');

/**
 * modal submit event
 * @event Egglord#ModalSubmit
 * @extends {Event}
*/
class ModalSubmit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {ModalSubmitInteraction} interaction The member that was warned
	 * @readonly
	*/
	async run(bot, interaction) {
		if (!interaction.guild) return interaction.reply({ content: 'Server only' });
		const { guild, member } = interaction;

		const reason = interaction.fields.fields.get('reportReason').value;
		const channel = guild.channels.cache.get(guild.settings.ModLogChannel);

		if (!channel) return interaction.reply({ content: 'No channel set for logging' });

		if (guild.settings.ModLogEvents?.includes('REPORT')) {
			const embed = new Embed(bot, guild)
				.setTitle(`Reported ${interaction.customId.split('_')[1]}`)
				.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
				.addFields(
					{ name: 'Reason:', value: reason ?? 'No reason given' },
				)
				.setTimestamp()
				.setFooter({ text: guild.name });

			// Add custom fields
			switch (interaction.customId.split('_')[1]) {
				case 'user': {
					const user = await bot.users.fetch(interaction.customId.split('_')[2]);
					embed.addFields(
						{ name: 'Tag:', value: user.displayName, inline: true },
						{ name: 'Created at:', value: moment(user.createdAt).format('lll'), inline: true },
					)
						.setImage(user.displayAvatarURL());
					break;
				}
				case 'message': {
					const message = await interaction.channel.messages.fetch(interaction.customId.split('_')[2]);
					embed.addFields(
						{ name: 'Content:', value: message.content, inline: true },
					);
					break;
				}

				default:

			}


			// Send report embed to mod log channel
			const repChannel = guild.channels.cache.get(guild.settings.ModLogChannel);
			if (repChannel) {
				repChannel.send({ embeds: [embed] });
				interaction.reply({ embeds: [channel.error('moderation/report:SUCCESS', { USER: member.user }, true)] });
			}

		} else {
			interaction.reply({ content: 'Reporting is not enabled in this server' });
		}

	}
}

module.exports = ModalSubmit;
