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
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Gets the status of the bot.',
			usage: 'status',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Get information on the services the bot provide
		const m = await message.channel.send(message.translate('misc/status:PONG'));

		const embed = new Embed(bot, message.guild)
			.addField(bot.translate('misc/status:PING'), `\`${m.createdTimestamp - message.createdTimestamp}ms\``, true)
			.addField(bot.translate('misc/status:CLIENT'), `\`${Math.round(bot.ws.ping)}ms\``, true)
			.addField(bot.translate('misc/status:MONGO'), `\`${Math.round(await bot.mongoose.ping())}ms\``, true)
			.setTimestamp();
		await message.channel.send({ embeds: [embed] });
		m.delete();
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		await interaction.reply(guild.translate('misc/status:PONG'));

		const embed = new Embed(bot, guild)
			.addField(bot.translate('misc/status:PING'), `\`${(await interaction.fetchReply()).createdTimestamp - interaction.createdTimestamp}ms\``, true)
			.addField(guild.translate('misc/status:CLIENT'), `\`${Math.round(bot.ws.ping)}ms\``, true)
			.addField(guild.translate('misc/status:MONGO'), `\`${Math.round(await bot.mongoose.ping())}ms\``, true)
			.setTimestamp();
		await interaction.editReply({ content: '‎', embeds: [embed] });
	}
}

module.exports = Status;
