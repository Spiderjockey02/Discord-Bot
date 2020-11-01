// Dependencies
const { Warning } = require('../../modules/database/models/index');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Check to see if user can kick members
	if (!message.member.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Get user
	const user = bot.GetUser(message, args);
	if (!user) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('clear-warning').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// get warnings of user
	try {
		// find data
		const data = await Warning.findOne({
			userID: user.id,
			guildID: message.guild.id,
		});
		// Delete the data
		if (data) {
			await Warning.deleteOne(data, function(err) {
				if (err) throw err;
			});
			message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} Warnings for ${user} has been cleared.` } }).then(m => m.delete({ timeout: 10000 }));
		} else {
			message.channel.send('This user has not been warned before.').then(m => m.delete({ timeout: 3500 }));
		}
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: clear-warnings.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'clear-warning',
	aliases: ['cl-warning', 'cl-warnings', 'clear-warnings'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Clear warnings',
	category: 'Moderation',
	description: 'Remove warnings from a user.',
	usage: '${PREFIX}clear-warning <user>',
	example: '${PREFIX}clear-warning @NaughtyPerson',
};
