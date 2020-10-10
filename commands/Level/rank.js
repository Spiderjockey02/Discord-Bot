// Dependencies
const Discord = require('discord.js');
const { Ranks } = require('../../modules/database/models/index');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// check to make sure Level plugin is enabled
	if (settings.LevelPlugin == false) return;
	// Get user
	let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
	if (!user) {
		user = message.guild.member(message.author);
	}
	// Retrieve Rank from databse
	try {
		await Ranks.findOne({
			userID: user.id,
			guildID: message.guild.id,
		}, (err, Xp) => {
			if(err) console.log(err);
			const embed = new Discord.MessageEmbed()
				.setAuthor(user.user.username);
			if (Xp == null) {
				// They haven't sent any messages yet
				embed.addField('Xp:', '0', true);
				embed.addField('Level:', '1', true);
				embed.setFooter('50 XP till level up', user.user.displayAvatarURL());
			} else {
				// Show users Rank
				embed.addField('Xp:', Xp.Xp, true);
				embed.addField('Level:', Xp.Level, true);
				embed.setFooter(`${(Xp.Level * 50) - Xp.Xp} XP till level up`, message.author.displayAvatarURL());
			}
			message.channel.send(embed);
		});
	} catch (err) {
		bot.logger.error(`${err.message} when running command: rank.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'rank',
	aliases: ['lvl', 'level'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Level',
	category: 'Level',
	description: 'Shows your rank/Level',
	usage: '${PREFIX}level [username]',
};
