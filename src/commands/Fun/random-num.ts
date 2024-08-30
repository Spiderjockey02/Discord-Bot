import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import EgglordClient from '../../base/Egglord';
import { ApplicationCommandOptionType, Message, ChatInputCommandInteraction } from 'discord.js';
const max = 100000;

/**
 * Random command
 * @extends {Command}
*/
export default class Random extends Command {
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

	async run(client: EgglordClient, message: Message) {

		// Random number and facts command
		const num1 = parseInt(message.args[0]),
			num2 = parseInt(message.args[1]);

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			if (message.deletable) message.delete();
			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:INCORRECT_FORMAT', { EXAMPLE: client.languageManager.translate(message.guild, 'fun/random:USAGE') });
			return message.channel.send({ embeds: [embed] });
		}

		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		const embed = new EgglordEmbed(client, message.guild)
			.setColor(client.config.embedColor)
			.setDescription(client.languageManager.translate(message.guild, 'fun/random:RESPONSE', { NUMBER: r }));

		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const num1 = interaction.options.getInteger('min', true),
			num2 = interaction.options.getInteger('max', true);

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:INCORRECT_FORMAT', { EXAMPLE:	client.languageManager.translate(interaction.guild, 'fun/random:USAGE') });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		const embed = new EgglordEmbed(client, null)
			.setDescription(client.languageManager.translate(interaction.guild, 'fun/random:RESPONSE', { NUMBER: r }));
		return interaction.reply({ embeds: [embed] });
	}
}
