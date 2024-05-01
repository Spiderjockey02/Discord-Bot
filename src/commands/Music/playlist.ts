// Dependencies
const { ApplicationCommandOptionType } = require('discord.js'),
	{ PlaylistSchema } = require('../../database/models'), ;
import Command from '../../structures/Command';

/**
 * playlist command
 * @extends {Command}
*/
export default class Playlist extends Command {
	/**
	   * @param {Client} client The instantiating client
	   * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'playlist',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-add'],
			description: 'Add a song to the playlist',
			usage: 'p-add <playlist name> <song>',
			cooldown: 3000,
			examples: ['p-add Songs https://www.youtube.com/watch?v=4AnmemzByVY'],
			slash: true,
			options: client.subCommands.filter(c => c.help.name.startsWith('playlist-')).map(c => ({
				name: c.help.name.replace('playlist-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
		});
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
		const channel = guild.channels.cache.get(interaction.channelId);
		const command = client.subCommands.get(`playlist-${interaction.options.getSubcommand()}`);
		try {
			if (command) {
				command.callback(client, interaction, guild, args);
			}
		} catch (err) {
			client.logger.error(`Command: 'playlist-${interaction.options.getSubcommand()}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}

	async autocomplete(client, interaction) {
		// Handle autocomplete for finding playlist name
		const playlists = await PlaylistSchema.find({ creator: interaction.user.id });

		if (playlists) interaction.respond(playlists.map(i => ({ name: i.name, value: i.name }))); else interaction.respond([]);
	}
}

