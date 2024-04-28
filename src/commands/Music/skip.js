// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * skip command
 * @extends {Command}
*/
class Skip extends Command {
	/**
	   * @param {Client} client The instantiating client
	   * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'skip',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['next', 'skipto'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Skips the current song.',
			usage: 'skip',
			cooldown: 3000,
			slash: true,
			options: [{
				name: 'amount',
				description: 'position in queue to skip to',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				required: false,
			}],
		});
	}

	/**
	   * Function for receiving message.
	   * @param {bot} bot The instantiating client
	   * @param {message} message The message that ran the command
	   * @readonly
  */
	async run(bot, message) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		const amount = message.args[0];

		// skip song
		const player = bot.manager?.players.get(message.guild.id);
		const queuelength = player.queue.length;
		const skiplength = !isNaN(amount) && amount > queuelength ? bot.translate('music/skip:SKIPPING_SONG') : bot.translate('music/skip:SKIPPING_SONGS', { NUM: amount });
		if (!isNaN(amount) && amount < queuelength) {
			player.stop(parseInt(message.args[0]));
			message.channel.send({ content: skiplength });
		} else {
			message.channel.send({ content: skiplength });
			player.stop();
		}
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			amount = args.get('amount')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// skip song
		const player = bot.manager?.players.get(member.guild.id);
		const queueLength = player.queue.length;
		const skipLength = !isNaN(amount) && amount > queueLength ? bot.translate('music/skip:SKIPPING_SONG') : bot.translate('music/skip:SKIPPING_SONGS', { NUM: amount });
		if (!isNaN(amount) && amount < queueLength) {
			player.stop(amount);
			interaction.reply({ content: skipLength });
		} else {
			interaction.reply({ content: skipLength });
			player.stop();
		}
	}
}

module.exports = Skip;
