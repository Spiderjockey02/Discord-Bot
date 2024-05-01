import { EmbedBuilder, PermissionFlagsBits, Message, CommandInteraction } from 'discord.js';
import Command from '../../structures/Command';
import { errorEmbed } from 'src/utils';
import EgglordClient from 'src/base/Egglord';

/**
 * Advice command
 * @extends {Command}
*/
export default class AdviceCommand extends Command {
	constructor() {
		super({
			name: 'advice',
			dirname: __dirname,
			description: 'Get some random advice',
			usage: 'advice',
			cooldown: 1000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message<true>) {

		// send 'waiting' message to show client has recieved message
		client.languageManager.get(message.guild.settings.language)('misc:FETCHING', {
			EMOJI: message.channel.checkPerm(PermissionFlagsBits.UseExternalEmojis) ? client.customEmojis['loading'] : '', ITEM: this.help.name });


		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Connect to API and fetch data
		try {
			const advice = await client.fetch('misc/advice');
			msg.delete();
			const embed = new EmbedBuilder()
				.setDescription(`💡 ${advice}`);
			message.channel.send({ embeds: [embed] });
		} catch (err: any) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();


			message.channel.send({ embeds: [errorEmbed(client, 'misc:ERROR_MESSAGE', { ERROR: err.message })] });

		}
	}

	async callback(client: EgglordClient, interaction: CommandInteraction<'cached'>) {
		try {
			const advice = await client.fetch('misc/advice');
			if (advice.error) throw new Error(advice.error);

			interaction.reply({ embeds: [{ color: client.config.embedColor, description: `💡 ${advice}` }] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [errorEmbed(client, 'misc:ERROR_MESSAGE', { ERROR: err.message })], ephemeral: true });
		}
	}
}
