// Dependencies
const { Embed } = require('../../utils'),
	{ TagsSchema } = require('../../database/models/index.js'),
	{ PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Tag view command
 * @extends {Command}
*/
export default class TagView extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'tag-view',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-view'],
			userPermissions: [Flags.ManageGuild],
			description: 'View the server\'s tag(s)',
			usage: 'tag-view [name]',
			cooldown: 2000,
			examples: ['tag-view'],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message) {
		// view all tags on the server
		try {
			const tags = await TagsSchema.find({ guildID: message.guild.id });

			// if no tags have been saved yet
			if (!tags[0]) return message.channel.error('tags/tag-view:NO_TAG');

			// check if an input was entered
			if (message.args[0]) {
				const tag = tags.find(t => t.name == message.args[0]);
				if (tag) return message.channel.send(tag.response);
			}

			// if no input was entered or tagName didn't match
			if (tags != null) {
				const resultEmbed = new Embed(client, message.guild)
					.setTitle('tags/tag-view:TITLE', { NAME:message.guild.name });
				tags.forEach(value => {
					resultEmbed.addFields({ name: message.translate('tags/tag-view:TITLE', { NAME: value.name }), value: message.translate('tags/tag-view:RESP', { RESP: value.response }) });
				});
				return message.channel.send({ embeds: [resultEmbed] });
			} else {
				return message.channel.error('tags/tag-view:NO_EXIST');
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}

	}
}

