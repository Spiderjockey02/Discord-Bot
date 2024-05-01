// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Loop command
 * @extends {Command}
*/
export default class Loop extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'loop',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['repeat'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Loops the song or queue.',
			usage: 'loop [queue / song]',
			cooldown: 3000,
			examples: ['loop queue', 'loop'],
			slash: true,
			options: [{
				name: 'type',
				type: ApplicationCommandOptionType.String,
				description: 'The entity you want to loop',
				required: false,
				choices: [
					{
						name: 'Queue',
						value: 'queue',
					},
					{
						name: 'Song',
						value: 'song',
					},
				],
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(client, message) {
		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, client);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		const player = client.manager?.players.get(message.guild.id);

		// Check what to loop (queue or song) - default to song
		if (!message.args[0] || message.args[0].toLowerCase() == 'song') {
			// (un)loop the song
			player.setTrackRepeat(!player.trackRepeat);
			const trackRepeat = message.translate(`misc:${player.trackRepeat ? 'ENABLED' : 'DISABLED'}`);
			return message.channel.send(message.translate('music/loop:TRACK', { TOGGLE: trackRepeat }));
		} else if (message.args[0].toLowerCase() == 'queue') {
			// (un)loop the queue
			player.setQueueRepeat(!player.queueRepeat);
			const queueRepeat = message.translate(`misc:${player.queueRepeat ? 'ENABLED' : 'DISABLED'}`);
			return message.channel.send(message.translate('music/loop:QUEUE', { TOGGLE: queueRepeat }));
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
			type = args.get('type')?.value;

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, client);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Check what to loop (queue or song) - default to song
		const player = client.manager?.players.get(member.guild.id);
		if (!type || type == 'song') {
			// (un)loop the song
			player.setTrackRepeat(!player.trackRepeat);
			const trackRepeat = guild.translate(`misc:${player.trackRepeat ? 'ENABLED' : 'DISABLED'}`);
			return interaction.reply({ content: client.translate('music/loop:TRACK', { TOGGLE: trackRepeat }) });
		} else if (type == 'queue') {
			// (un)loop the queue
			player.setQueueRepeat(!player.queueRepeat);
			const queueRepeat = guild.translate(`misc:${player.queueRepeat ? 'ENABLED' : 'DISABLED'}`);
			return interaction.reply({ content: client.translate('music/loop:QUEUE', { TOGGLE: queueRepeat }) });
		}
	}
}

