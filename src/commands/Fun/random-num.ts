// Dependencies
import EgglordClient from 'src/base/Egglord';
import Command from '../../structures/Command';
import { Message, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
const max = 100000;

/**
 * Random command
 * @extends {Command}
*/
export default class Random extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'random-num',
			dirname: __dirname,
			description: 'Replies with a random number.',
			usage: 'random <LowNum> <HighNum>',
			cooldown: 1000,
			examples: ['random 1 10', 'random 5 99'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'min',
				description: 'The minimum number',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				maxValue: 2147483647,
				required: true,
			},
			{
				name: 'max',
				description: 'The maximum number',
				type: ApplicationCommandOptionType.Integer,
				minValue: 1,
				maxValue: 2147483647,
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(client: EgglordClient, message: Message<true>, settings) {

		// Random number and facts command
		const num1 = parseInt(message.args[0]),
			num2 = parseInt(message.args[1]);

		// Make sure clienth entries are there
		if (!num1 || !num2) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) });
		}

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) });
		}

		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		const embed = new EmbedBuilder()
			.setColor(client.config.embedColor)
			.setDescription(message.translate('fun/random:RESPONSE', { NUMBER: r }));
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			settings = guild.settings,
			num1 = args.get('min').value,
			num2 = args.get('max').value;

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			interaction.reply({ embeds: [channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(client.translate('fun/random:USAGE')) }, true)], ephemeral: true });
		}
		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		return interaction.reply({ embeds: [{ color: client.config.embedColor, description: guild.translate('fun/random:RESPONSE', { NUMBER: r }) }] });
	}
}

