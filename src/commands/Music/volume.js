// Dependencies
const { Embed } = require('../../utils'),
	{ functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Back extends Command {
	constructor(bot) {
		super(bot, {
			name: 'volume',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['vol'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Changes the volume of the song',
			usage: 'volume <Number>',
			cooldown: 3000,
			examples: ['volume 50'],
			slash: true,
			options: [{
				name: 'volume',
				description: 'The volume you want the song to play at.',
				type: 'INTEGER',
				required: true,
			}],
		});
	}

	// Function for message command
	async run(bot, message) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		const player = bot.manager.players.get(message.guild.id);

		// Make sure a number was entered
		if (!message.args[0]) {
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/volume:CURRENT', { NUM: player.volume }));
			return message.channel.send({ embeds: [embed] });
		}

		// make sure the number was between 0 and 1000
		if (Number(message.args[0]) <= 0 || Number(message.args[0]) > 1000) return message.channel.error('music/volume:TOO_HIGH').then(m => m.timedDelete({ timeout: 10000 }));

		// Update volume
		player.setVolume(Number(message.args));
		const embed = new Embed(bot, message.guild)
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate('music/volume:UPDATED', { NUM: player.volume }));
		return message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			volume = args.get('volume').value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Make sure a number was entered
		const player = bot.manager.players.get(member.guild.id);
		if (!volume) {
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/volume:CURRENT', { NUM: player.volume }));
			return interaction.reply(embed);
		}

		// make sure volume is between 0 and 1000
		if (volume <= 0 || volume > 1000) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/volume:TOO_HIGH', { ERROR: null }, true)] });

		// Update volume
		player.setVolume(volume);
		const embed = new Embed(bot, guild)
			.setColor(member.displayHexColor)
			.setDescription(guild.translate('music/volume:UPDATED', { NUM: player.volume }));
		return interaction.reply(embed);
	}
};
