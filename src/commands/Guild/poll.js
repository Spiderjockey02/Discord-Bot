// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Poll extends Command {
	constructor(bot) {
		super(bot, {
			name:  'poll',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Create a poll for users to answer.',
			usage: 'poll <question>',
			cooldown: 2000,
			examples: ['poll Is this a good bot?'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check bot for add reaction permission
		if (!message.channel.permissionsFor(bot.user).has('ADD_REACTIONS')) {
			bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure a poll was provided
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Send poll to channel
		const embed = new MessageEmbed()
			.setColor(0xffffff)
			.setTitle(bot.translate(settings.Language, 'GUILD/POLL_TITLE', message.author.username))
			.setDescription(message.args.join(' '))
			.setFooter(bot.translate(settings.Language, 'GUILD/POLL_FOOTER'))
			.setTimestamp();
		message.channel.send(embed).then(async (msg) => {
			// Add reactions to message
			await msg.react('✅');
			await msg.react('❌');
		});
	}
};
