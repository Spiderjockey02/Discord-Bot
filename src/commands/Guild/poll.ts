import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';

/**
 * Poll command
 * @extends {Command}
*/
export default class Poll extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(client: EgglordClient) {
		super(client, {
			name:  'poll',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [PermissionFlagsBits.AddReactions],
			description: 'Create a poll for users to answer.',
			usage: 'poll <question>',
			cooldown: 2000,
			examples: ['poll Is this a good client?'],
			slash: true,
			options: [
				{
					name: 'poll',
					description: 'What to poll.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// Send poll to channel
		const embed = new EgglordEmbed(client, message.guild)
			.setTitle('guild/poll:TITLE', { USER: message.author.displayName })
			.setDescription(message.args.join(' '))
			.setFooter({ text: client.languageManager.translate(message.guild, 'guild/poll:FOOTER') });
		message.channel.send({ embeds: [embed] }).then(async (msg) => {
			// Add reactions to message
			await Promise.all([msg.react('✅'), msg.react('❌')]);
		});
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const text = interaction.options.getString('poll', true);

		// Send poll to channel
		const embed = new EgglordEmbed(client, interaction.guild)
			.setTitle('guild/poll:TITLE', { USER: interaction.user.displayName })
			.setDescription(text)
			.setFooter({ text: client.languageManager.translate(interaction.guild, 'guild/poll:FOOTER') });
		interaction.reply({ embeds: [embed],	fetchReply: true }).then(async (msg) => {
			// Add reactions to message
			await Promise.all([msg.react('✅'), msg.react('❌')]);
		});
	}
}

