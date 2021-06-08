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
			usage: 'discrim <discriminator>',
			cooldown: 2000,
			examples: ['discrim 6686'],
			slash: true,
			options: [{
				name: 'discrim',
				description: 'The discriminator you want search for.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure a discriminator was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('guild/discrim:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Get all members with the entered discriminator
		const members = message.guild.members.cache.filter(m => m.user.discriminator == message.args[0]).map(m => m);

		const embed = new Embed(bot, message.guild)
			.setTitle('guild/discrim:TITLE', { DISCRIM: message.args[0] })
			.setDescription(members);
		message.channel.send(embed);
	}
	async callback(bot, interaction, guild, args) {
		const discrim = args.get("discrim").value
		// Get all members with the entered discriminator
		const members = guild.members.cache.filter(m => m.user.discriminator == discrim).map(m => m);

		const embed = new Embed(bot, guild)
			.setTitle('guild/discrim:TITLE', { DISCRIM: discrim })
			.setDescription(members);
		bot.send(interaction, embed);
	}
};
