// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * remove command
 * @extends {Command}
*/
export default class Remove extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'remove',
			guildOnly: true,
			dirname: __dirname,
			description: 'Removes a song from the queue',
			usage: 'remove <position> [position]',
			cooldown: 3000,
			examples: ['remove 3', 'remove 3 7'],
			slash: true,
			options: [{
				name: 'position',
				description: 'The position of the queue.',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				required: true,
			},
			{
				name: 'newposition',
				description: 'The 2nd position of the queue.',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				required: false,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(client, message, settings) {
		// check to make sure client can play music based on permissions
		const playable = checkMusic(message.member, client);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		const player = client.manager?.players.get(message.guild.id);

		if (isNaN(message.args[0])) return message.channel.error(message.translate('music/remove:NAN'));

		if (!message.args[1]) {
			if (message.args[0] == 0) return message.channel.error('music/remove:PLAYING', { PREFIX: settings.prefix });
			if (message.args[0] > player.queue.length) return message.channel.error(message.translate('music/remove:MISSING'));

			const { title } = player.queue[message.args[0] - 1];

			player.queue.splice(message.args[0] - 1, 1);
			return message.channel.send(message.translate('music/remove:REMOVED', { TITLE: title }));
		} else {
			if (message.args[0] == 0 || message.args[1] == 0) return message.channel.error('music/remove:PLAYING', { PREFIX: settings.prefix });
			if (message.args[0] > player.queue.length || message.args[1] > player.queue.length) return message.channel.error('music/remove:MISSING');
			if (message.args[0] > message.args[1]) return message.channel.error('music/remove:INVALID');

			const songsToRemove = message.args[1] - message.args[0];
			player.queue.splice(message.args[0] - 1, songsToRemove + 1);
			return message.channel.send(message.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
		}
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			pos1 = args.get('position').value,
			pos2 = args.get('newposition')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, client);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		const player = client.manager?.players.get(member.guild.id);
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
			return interaction.reply(client.translate('music/remove:REMOVED_MULTI', { NUM: songsToRemove + 1 }));
		}
	}
}

