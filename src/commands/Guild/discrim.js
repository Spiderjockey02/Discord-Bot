// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Discrim extends Command {
	constructor(bot) {
		super(bot, {
			name: 'discrim',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['discriminator'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Discrim',
			usage: 'discrim [discriminator]',
			cooldown: 2000,
			examples: ['discrim 6686'],
			slash: true,
			options: [{
				name: 'discrim',
				description: 'The discriminator you want to search for.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message) {
		// Make sure a discriminator was entered
		const discrim = message.args[0] ?? message.author.discriminator;

		// Get all members with the entered discriminator
		const members = message.guild.members.cache.filter(m => m.user.discriminator == discrim).map(m => m);

		const embed = new Embed(bot, message.guild)
			.setTitle('guild/discrim:TITLE', { DISCRIM: message.args[0] })
			.setDescription(members.join(' '));
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const discrim = args.get('discrim')?.value ?? guild.members.cache.get(interaction.user.id).user.discriminator;
		// Get all members with the entered discriminator
		const members = guild.members.cache.filter(m => m.user.discriminator == discrim).map(m => m);

		const embed = new Embed(bot, guild)
			.setTitle('guild/discrim:TITLE', { DISCRIM: discrim })
			.setDescription(`${members}`);
		interaction.reply({ embeds: [embed] });
	}
};
