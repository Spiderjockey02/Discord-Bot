// Dependencies
const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Bassboost command
 * @extends {Command}
*/
class Bassboost extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'effects-filter',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['bb'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Bassboost the song',
			usage: 'bassboost [value]',
			cooldown: 3000,
			examples: ['bb 8', 'bb'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'filter',
				description: 'The amount you want to bass-boost the song.',
				choices: ['nightcore', 'vaporwave', 'reset'].map(i => ({ name: i, value: i })),
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			filter = args.get('filter').value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Toggle the filter
		const player = bot.manager?.players.get(member.guild.id);
		if (filter == 'reset') {
			player.resetFilter();
		} else {
			player[`set${filter.charAt(0).toUpperCase() + filter.slice(1)}`](!player[filter]);
		}


		await interaction.reply({ content: guild.translate(`music/${filter}:${player[filter] ? 'ON' : 'OFF'}_NC`) });
		const embed = new EmbedBuilder()
			.setDescription(guild.translate(`music/${filter}:DESC_${player[filter] ? '1' : '2'}`));
		await bot.delay(5000);
		if (player.nightcore) player.speed = 1.2;
		return interaction.editReply({ content: '​​ ', embeds: [embed] });
	}
}

module.exports = Bassboost;
