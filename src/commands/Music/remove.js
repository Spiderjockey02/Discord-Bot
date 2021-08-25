// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * remove command
 * @extends {Command}
*/
class Remove extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'remove',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Removes a song from the queue',
			usage: 'remove <position> [position]',
			cooldown: 3000,
			examples: ['remove 3', 'remove 3 7'],
			slash: true,
			options: [{
				name: 'position',
				description: 'The position of the queue.',
				type: 'INTEGER',
				required: true,
			},
			{
				name: 'newposition',
				description: 'The 2nd position of the queue.',
				type: 'INTEGER',
				required: false,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// check to make sure bot can play music based on permissions
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

		const player = bot.manager?.players.get(message.guild.id);

		if (isNaN(message.args[0])) return message.channel.send(message.translate('music/remove:NAN')).then(m => m.timedDelete({ timeout: 10000 }));

		if (!message.args[1]) {
			if (message.args[0] == 0) return message.channel.send(message.translate('music/remove:PLAYING', { PREFIX: settings.prefix }));
			if (message.args[0] > player.queue.length) return message.channel.send(message.translate('music/remove:MISSING')).then(m => m.timedDelete({ timeout: 10000 }));

			const { title } = player.queue[message.args[0] - 1];

			player.queue.splice(message.args[0] - 1, 1);
			return message.channel.send(message.translate('music/remove:REMOVED', { TITLE: title }));
		} else {
			if (message.args[0] == 0 || message.args[1] == 0) return message.channel.send(message.translate('music/remove:PLAYING', { PREFIX: settings.prefix }));
			if (message.args[0] > player.queue.length || message.args[1] > player.queue.length) return message.channel.send(message.translate('music/remove:MISSING'));
			if (message.args[0] > message.args[1]) return message.channel.send(message.translate('music/remove:INVALID'));

			const songsToRemove = message.args[1] - message.args[0];
			player.queue.splice(message.args[0] - 1, songsToRemove + 1);
			return message.channel.send(message.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
		}
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			pos1 = args.get('position').value,
			pos2 = args.get('newposition')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		const player = bot.manager?.players.get(member.guild.id);
		if (!pos2) {
			if (pos1 == 0) return interaction.reply({ content: guild.translate('music/remove:PLAYING') });
			if (pos1 > player.queue.length) return interaction.reply({ content: guild.translate('music/remove:MISSING') });
			const { title } = player.queue[pos1 - 1];

			player.queue.splice(pos1 - 1, 1);
			return interaction.reply({ content: guild.translate('music/remove:REMOVED', { TITLE: title }) });
		} else {
			if (pos1 == 0 || pos2 == 0) return interaction.reply({ content: guild.translate('music/remove:PLAYING') });
			if (pos1 > player.queue.length || pos2 > player.queue.length) return interaction.reply({ content: guild.translate('music/remove:MISSING') });
			if (pos1 > pos2) return interaction.reply({ content: guild.translate('music/remove:INVALID') });

			const songsToRemove = pos2 - pos1;
			player.queue.splice(pos1 - 1, songsToRemove + 1);
			return interaction.reply(bot.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
		}
	}
}

module.exports = Remove;
