// Dependencies
const { PlaylistSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * playlist delete command
 * @extends {Command}
*/
export default class PDelete extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'playlist-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-delete'],
			description: 'Delete a playlist',
			usage: 'p-delete <playlist name>',
			cooldown: 3000,
			examples: ['p-delete Songs'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'name',
					description: 'The name of the playlist',
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(client, message, settings) {
		// Make sure a playlist name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-delete:USAGE')) });

		const resp = await this.deletePlaylist(client, message.channel, message.author, message.args[0]);
		message.channel.send({ embeds: [resp] });
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
		const channel = guild.channels.cache.get(interaction.channelId),
			playlistName = args.get('name').value;

		const resp = await this.deletePlaylist(client, channel, interaction.user, playlistName);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for deleting playlist
	 * @param {client} client The instantiating client
	 * @param {channel} channel The interaction that ran the command
	 * @param {user} user The guild the interaction ran in
	 * @param {string} playlistName The options provided in the command, if any
	 * @readonly
	*/
	async deletePlaylist(client, channel, user, playlistName) {
		try {
			const playlist = PlaylistSchema.findOne({
				name: playlistName,
				creator: user.id,
			});

			if (!playlist) {
				return channel.error('music/p-delete:MISSING', { TITLE: playlistName }, true);
			} else {
				await PlaylistSchema.findOneAndRemove({ name: playlistName,	creator: user.id });
				return channel.success('music/p-delete:SUCCESS', { TITLE: playlistName }, true);
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

