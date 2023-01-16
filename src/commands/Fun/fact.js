// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Fact command
 * @extends {Command}
*/
class Fact extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'fact',
			dirname: __dirname,
			aliases: ['facts'],
			description: 'Receive a random fact.',
			usage: 'fact',
			slash: true,
			cooldown: 1000,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// Get the random facts file
		try {
			const fact = await bot.fetch('misc/random-fact');
			const embed = new Embed(bot, message.guild)
				.setTitle('fun/fact:FACT_TITLE')
				.setDescription(fact);
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
  */
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);

		try {
			const fact = await bot.fetch('misc/random-fact');
			const embed = new Embed(bot, guild)
				.setTitle('fun/fact:FACT_TITLE')
				.setDescription(fact);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			await interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = Fact;
