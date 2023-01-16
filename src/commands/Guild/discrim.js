// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Discrim command
 * @extends {Command}
*/
class Discrim extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'discrim',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['discriminator'],
			description: 'Discrim',
			usage: 'discrim [discriminator]',
			cooldown: 2000,
			examples: ['discrim 6686'],
			slash: true,
			options: [{
				name: 'discrim',
				description: 'The discriminator you want to search for.',
				type: ApplicationCommandOptionType.Integer,
				minValue: 0,
				maxValue: 9999,
				required: false,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Make sure a discriminator was entered
		const discrim = message.args[0] ?? message.author.discriminator;

		// Get all members with the entered discriminator
		const embed = this.fetchDiscrimData(bot, message.guild, discrim);
		message.channel.send({ embeds: [embed] });
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
		const discrim = args.get('discrim')?.value ?? guild.members.cache.get(interaction.user.id).user.discriminator;

		// Get all members with the entered discriminator
		const embed = this.fetchDiscrimData(bot, guild, discrim);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for getting all members with a certain discrim
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the interaction ran in
	 * @param {string} discrim The discrim to checks members to
	 * @readonly
	*/
	fetchDiscrimData(bot, guild, discrim) {
		const members = guild.members.cache.filter(m => m.user.discriminator == discrim).map(m => m);

		const embed = new Embed(bot, guild)
			.setTitle('guild/discrim:TITLE', { DISCRIM: discrim })
			.setDescription(members.length > 0 ? members.join(' ') : null);
		return embed;
	}
}

module.exports = Discrim;
