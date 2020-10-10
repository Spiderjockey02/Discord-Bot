// Dependencies
const Discord = require('discord.js');
const { Warning } = require('../../modules/database/models/index');

module.exports.run = async (bot, message, args, emojis, settings) => {
	if (message.deletable) message.delete();
	// Get user
	let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
	if (!user) {
		user = message.guild.member(message.author);
	}
	// get warnings of user
	try {
		console.log(Warning);
		await Warning.findOne({
			userID: user.id,
			guildID: message.guild.id,
		}, (err, warn) => {
			if(err) console.log(err);
			if (warn == null) {
				message.channel.send('This user has not been warned before.').then(m => m.delete({ timeout: 3500 }));
			} else {
				console.log(warn);
			}
		});
	} catch (err) {
		bot.logger.error(`${err.message} when running command: warnings.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'warnings',
	aliases: ['warns'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Warnings',
	category: 'Moderation',
	description: 'Shows number of warnings a user has',
	usage: '${PREFIX}warnings [user]',
};
