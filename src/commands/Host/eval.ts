import { inspect } from 'util';
import { EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ErrorEmbed } from '../../structures';
import EgglordClient from 'base/Egglord';


/**
 * Eval command
 * @extends {Command}
*/
export default class Eval extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'eval',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Evaluates JS code.',
			usage: 'eval <code>',
			cooldown: 3000,
			examples: ['eval client.users.cache.get(\'184376969016639488\')'],
			slash: true,
			options: [{
				name: 'code',
				description: 'The code to evaluate.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// Evaluated the code
		const toEval = message.args.join(' ');
		try {
			if (toEval) {
				const hrStart = process.hrtime(),
					evaluated = await eval(toEval),
					hrDiff = process.hrtime(hrStart);

				const embed = new EmbedBuilder()
					.addFields(
						{ name: 'Input:\n', value: '```js\n' + `${toEval.substring(0, 1010)}` + '```' },
						{ name: 'Output:\n', value: '```js\n' + `${inspect(evaluated).substring(0, 1010)}` + '```' },
						{ name: 'Time:\n', value: `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*`, inline: true },
						{ name: 'Type:\n', value: `${typeof (evaluated)}`, inline: true },
					);
				message.channel.send({ embeds: [embed] });
			} else {
				const embed = new ErrorEmbed(client, message.guild)
					.setMessage('misc:INCORRECT_FORMAT', { EXAMPLE: client.languageManager.translate(message.guild, 'host/eval:USAGE') });

				message.channel.send({ embeds: [embed] });
			}
		} catch (err: any) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });

			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const toEval = interaction.options.getString('code', true);

		try {
			const hrStart = process.hrtime(),
				evaluated = await eval(toEval),
				hrDiff = process.hrtime(hrStart);

			const embed = new EmbedBuilder()
				.addFields(
					{ name: 'Input:\n', value: '```js\n' + `${toEval.substring(0, 1010)}` + '```' },
					{ name: 'Output:\n', value: '```js\n' + `${inspect(evaluated).substring(0, 1010)}` + '```' },
					{ name: 'Time:\n', value: `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''} ${hrDiff[1] / 1000000}ms.*`, inline: true },
					{ name: 'Type:\n', value: `${typeof (evaluated)}`, inline: true },
				);
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
}