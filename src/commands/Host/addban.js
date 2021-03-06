// Dependencies
const { Globalban } = require('../../modules/database/models'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Addban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'addban',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Add a ban to the global ban list.',
			usage: 'addban <userID> <servers | commands> <reason>',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// get information
		const user = await bot.getUser(args[0]);
		const restriction = args[1];
		if (!['servers', 'commands'].includes(restriction)) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		args.splice(0, 2);
		const reason = (args[0]) ? args.join(' ') : message.translate(settings.Language, 'NO_REASON');

		// update database
		Globalban.findOne({
			userID: user.id,
		}, async (err, res) => {
			if (err) bot.logger.error(err.message);

			// This is their first warning
			if (!res) {
				const newBan = new Globalban({
					userID: user.id,
					reason: reason,
					restriction: restriction,
					IssueDate: new Date().toUTCString(),
				});
				newBan.save().catch(e => bot.logger.error(e.message));
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setAuthor(`${user.tag} has been globally banned`)
					.setDescription(`**Reason:** ${reason}\n**Restriction:** ${restriction}`);
				message.channel.send(embed).then(m => m.delete({ timeout: 30000 }));
			} else {
				message.channel.send('User is already banned.');
			}
		});
	}
};
