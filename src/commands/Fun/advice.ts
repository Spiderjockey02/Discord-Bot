// Dependencies
import { EmbedBuilder } from "discord.js";
import Command from '../../structures/Command'

/**
 * Advice command
 * @extends {Command}
*/
const AdviceCommand = new Command({
	name: 'advice',
	dirname: __dirname,
	description: 'Get some random advice',
	usage: 'advice',
	cooldown: 1000,
	slash: true,
})

AdviceCommand.run = async (bot, message) => {
	// send 'waiting' message to show bot has recieved message
	const msg = await message.channel.send(message.translate('misc:FETCHING', {
		EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

	// Connect to API and fetch data
	try {
		const advice = await bot.fetch('misc/advice');
		msg.delete();
		const embed = new EmbedBuilder()
			.setDescription(`💡 ${advice}`);
		message.channel.send({ embeds: [embed] });
	} catch (err) {
		if (message.deletable) message.delete();
		bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		msg.delete();
		message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
	}
}

AdviceCommand.callback = async (bot, interaction, guild) => {
	const channel = guild.channels.cache.get(interaction.channelId);
	try {
		const advice = await bot.fetch('misc/advice');
		if (advice.error) throw new Error(advice.error);

		interaction.reply({ embeds: [{ color: bot.config.embedColor, description: `💡 ${advice}` }] });
	} catch (err) {
		bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
	}
}


export default AdviceCommand
