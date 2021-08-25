// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Guildicon command
 * @extends {Command}
*/
class Guildicon extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name:  'guildicon',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['servericon'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get the server\'s icon.',
			usage: 'guildicon',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Check for guild icon & send message
		if (message.guild.icon) {
			const embed = new Embed(bot, message.guild)
				.setDescription(message.translate('guild/guildicon:ICON', { URL: message.guild.iconURL({ dynamic: true, size: 1024 }) }))
				.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
			message.channel.send({ embeds: [embed] });
		} else {
			if (message.deletable) message.delete();
			message.channel.error('guild/guildicon:NO_GUILD_ICON').then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);
		// Check for guild icon & send message
		if (guild.icon) {
			const embed = new Embed(bot, guild)
				.setDescription(guild.translate('guild/guildicon:ICON', { URL: guild.iconURL({ dynamic: true, size: 1024 }) }))
				.setImage(guild.iconURL({ dynamic: true, size: 1024 }));
			interaction.reply({ embeds: [embed] });
		} else {
			interaction.reply({ embeds: [channel.error('guild/guildicon:NO_GUILD_ICON', { }, true)], ephemeral: true });
		}
	}
}

module.exports = Guildicon;
