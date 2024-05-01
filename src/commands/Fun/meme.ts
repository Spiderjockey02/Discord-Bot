import { Setting } from '@prisma/client';
import { CommandInteraction, Guild, Message, TextBasedChannel } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Command from 'src/structures/Command';

/**
 * Meme command
 * @extends {Command}
*/
export default class Meme extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'meme',
			dirname: __dirname,
			description: 'Sends a random meme.',
			usage: 'meme',
			cooldown: 1000,
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client: EgglordClient, message: Message<true>, settings: Setting) {
		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Retrieve a random meme
		const embed = await this.fetchMeme(client, message.channel, settings);

		// Send the meme to channel
		msg.delete();
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(client: EgglordClient, interaction: CommandInteraction<'cached'>, guild: Guild) {
		const settings = guild.settings;
		const embed = await this.fetchMeme(client, interaction.channel);
		return interaction.reply({ embeds: [embed] });
	}

	/**
 	 * Function for fetching meme embed.
 	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command ran in
 	 * @param {settings} guildSettings The settings of the guild
 	 * @returns {embed}
	*/
	async fetchMeme(client: EgglordClient, channel: TextBasedChannel) {
		const subreddits = ['meme', 'memes', 'dankmemes', 'ComedyCemetery'];

		return await client.commands.get('reddit').fetchPost(client, channel, subreddits[Math.floor(Math.random() * subreddits.length)], 'hot');
	}
}

