// Dependencies
const max = 100000,
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Random command
 * @extends {Command}
*/
class Random extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'random',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Replies with a random number.',
			usage: 'random <LowNum> <HighNum>',
			cooldown: 1000,
			examples: ['random 1 10', 'random 5 99'],
			slash: true,
			options: [{
				name: 'min',
				description: 'The minimum number',
				type: 'INTEGER',
				required: true,
			},
			{
				name: 'max',
				description: 'The maximum number',
				type: 'INTEGER',
				required: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {

		// Random number and facts command
		const num1 = parseInt(message.args[0]),
			num2 = parseInt(message.args[1]);

		// Make sure both entries are there
		if (!num1 || !num2) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setDescription(message.translate('fun/random:RESPONSE', { NUMBER: r }));
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			settings = guild.settings,
			num1 = args.get('min').value,
			num2 = args.get('max').value;

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			interaction.reply({ embeds: [channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(bot.translate('fun/random:USAGE')) }, true)], ephemeral: true });
		}
		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		return interaction.reply({ embeds: [{ color: 'RANDOM', description: guild.translate('fun/random:RESPONSE', { NUMBER: r }) }] });
	}
}

module.exports = Random;
