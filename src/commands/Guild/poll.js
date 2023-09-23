// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Poll command
 * @extends {Command}
*/
class Poll extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name:  'poll',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Create a poll for users to answer.',
			usage: 'poll <question>',
			cooldown: 2000,
			examples: ['poll Is this a good bot?'],
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

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Make sure a poll was provided
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('guild/poll:USAGE')) });

		// Send poll to channel
		const embed = new Embed(bot, message.guild)
			.setTitle('guild/poll:TITLE', { USER: message.author.displayName })
			.setDescription(message.args.join(' '))
			.setFooter({ text: message.guild.translate('guild/poll:FOOTER') });
		message.channel.send({ embeds: [embed] }).then(async (msg) => {
			// Add reactions to message
			await msg.react('✅');
			await msg.react('❌');
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const text = args.get('poll').value;

		// Send poll to channel
		const embed = new Embed(bot, guild)
			.setTitle('guild/poll:TITLE', { USER: interaction.user.displayName })
			.setDescription(text)
			.setFooter({ text: guild.translate('guild/poll:FOOTER') });
		interaction.reply({ embeds: [embed],	fetchReply: true }).then(async (msg) => {
			// Add reactions to message
			await msg.react('✅');
			await msg.react('❌');
		});
	}
}

module.exports = Poll;
