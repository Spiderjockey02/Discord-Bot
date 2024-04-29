// Dependencies
const Command = require('../../structures/Command.js'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ ReactionRoleSchema } = require('../../database/models');

/**
 * Reaction role remove command
 * @extends {Command}
*/
class ReactionRoleRemove extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rr-remove',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['reactionroles-remove', 'rr-delete'],
			userPermissions: [Flags.ManageGuild],
			description: 'Make reaction roles',
			usage: 'reactionroles <messagelink>',
			cooldown: 5000,
			examples: ['reactionroles https://discord.com/channels/750822670505082971/761619652009787392/837657228055937054'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'message_link',
				description: 'The message url of the reaction role embed.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// make sure an arg was sent aswell
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('plugins/rr-remove:USAGE')) });

		// fetch and validate message
		const patt = /https?:\/\/(?:(?:canary|ptb|www)\.)?discord(?:app)?\.com\/channels\/(?:@me|(?<g>\d+))\/(?<c>\d+)\/(?<m>\d+)/g;
		let msg;
		if (patt.test(message.args[0])) {
			const stuff = message.args[0].split('/');
			try {
				msg = await bot.guilds.cache.get(stuff[4])?.channels.cache.get(stuff[5])?.messages.fetch(stuff[6]);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			return message.channel.send(message.translate('plugins/rr-add:INVALID'));
		}

		// delete message and then remove database
		try {
			await msg.delete();
			await ReactionRoleSchema.findOneAndRemove({ messageID: msg.id,	channelID: msg.channel.id });
			message.channel.send(message.translate('plugins/rr-remove:SUCCESS'));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
		const messageLink = args.get('message_link').value,
			channel = guild.channels.cache.get(interaction.channelId);

		// fetch and validate message
		const patt = /https?:\/\/(?:(?:canary|ptb|www)\.)?discord(?:app)?\.com\/channels\/(?:@me|(?<g>\d+))\/(?<c>\d+)\/(?<m>\d+)/g;
		let msg;
		if (patt.test(messageLink)) {
			const stuff = messageLink.split('/');
			try {
				msg = await bot.guilds.cache.get(stuff[4])?.channels.cache.get(stuff[5])?.messages.fetch(stuff[6]);
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		} else {
			return interaction.reply({ content: guild.translate('plugins/rr-add:INVALID'), ephemeral: true });
		}

		// delete message and then remove database
		try {
			await msg.delete();
			await ReactionRoleSchema.findOneAndRemove({ messageID: msg.id,	channelID: msg.channel.id });
			return interaction.reply({ content: guild.translate('plugins/rr-remove:SUCCESS'), ephemeral: true });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

module.exports = ReactionRoleRemove;
