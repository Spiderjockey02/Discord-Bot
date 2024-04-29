// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Status command
 * @extends {Command}
*/
class Status extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'status',
			dirname: __dirname,
			aliases: ['stat', 'ping'],
			description: 'Gets the status of the bot.',
			usage: 'status',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Get information on the services the bot provide
		const m = await message.channel.send(message.translate('misc/status:PONG'));

		const embed = new Embed(bot, message.guild)
			.addFields(
				{ name: bot.translate('misc/status:PING'), value: `\`${m.createdTimestamp - message.createdTimestamp}ms\``, inline: true },
				{ name: bot.translate('misc/status:CLIENT'), value: `\`${Math.round(bot.ws.ping)}ms\``, inline: true },
				{ name: bot.translate('misc/status:MONGO'), value:  `\`${Math.round(await bot.mongoose.ping())}ms\``, inline: true },
			)
			.setTimestamp();
		await message.channel.send({ embeds: [embed] });
		m.delete();
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const msg = await interaction.reply({ content: guild.translate('misc/status:PONG'), fetchReply: true });

		const embed = new Embed(bot, guild)
			.addFields(
				{ name: bot.translate('misc/status:PING'), value: `\`${msg.createdTimestamp - interaction.createdTimestamp}ms\``, inline: true },
				{ name: bot.translate('misc/status:CLIENT'), value: `\`${Math.round(bot.ws.ping)}ms\``, inline: true },
				{ name: bot.translate('misc/status:MONGO'), value:  `\`${Math.round(await bot.mongoose.ping())}ms\``, inline: true },
			)
			.setTimestamp();
		await interaction.editReply({ content: '‎', embeds: [embed] });
	}
}

module.exports = Status;
