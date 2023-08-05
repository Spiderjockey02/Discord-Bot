// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Cat command
 * @extends {Command}
*/
class Animal extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'animal',
			dirname: __dirname,
			aliases: ['meow'],
			description: 'Have a nice picture of a cat.',
			usage: 'animal',
			cooldown: 2000,
			slash: true,
			options: [{
				name: 'name',
				description: 'The name of the animal',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
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
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		const imageURL = await bot.fetch('misc/animal', { name: message.args[0] });

		msg.delete();
		// send image
		const embed = new Embed(bot, message.guild)
			.setColor(3426654)
			.setImage(imageURL);
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			name = args.get('name')?.value;

		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });

		try {
			const imageURL = await bot.fetch('misc/animal', { name });
			if (imageURL.error) throw new Error(imageURL.error);
			// send image
			const embed = new Embed(bot, guild)
				.setColor(3426654)
				.setImage(imageURL[Math.floor((Math.random() * imageURL.length))].imageURL);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	async autocomplete(bot, interaction) {
		// Get current input and make sure it's not 0
		const searchQuery = interaction.options.getFocused(true).value;
		if (searchQuery.length == 0) return interaction.respond([]);

		// Fetch animal list and filter based on 'startsWith'
		const animalList = await bot.fetch('misc/animal/raw');
		const slctdAnimals = animalList.filter(i => i.toLowerCase().startsWith(searchQuery.toLowerCase())).slice(0, 10);
		interaction.respond(slctdAnimals.map(i => ({ name: i, value: i })));
	}
}

module.exports = Animal;
