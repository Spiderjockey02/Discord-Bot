// Dependecies
const Command = require('../../structures/Command.js');

module.exports = class Setlang extends Command {
	constructor(bot) {
		super(bot, {
			name: 'set-lang',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['setlanguage', 'setlang'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Choose the language for the bot.',
			usage: 'setlang <language>',
			cooldown: 5000,
			examples: ['setlang english'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// get language
		const language = bot.languages.find((l) => l.name === message.args[0] || l.aliases.includes(message.args[0]));
		if (!message.args[0] || !language) {
			return message.channel.error('plugins/set-lang:MISSING_LANG', { list: bot.languages.map((l) => '`' + l.name + '`').join(', ') });
		}

		// update database
		try {
			await message.guild.updateGuild({ Language: language.name });
			settings.Language = language.name;
			return message.channel.success('plugins/set-lang:SUCCESS', { NAME: language.nativeName });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
