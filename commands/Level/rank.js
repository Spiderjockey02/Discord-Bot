const Discord = require('discord.js');
const Ranks = require('../../modules/database/models/levels');
module.exports.run = async (bot, message, args, emojis, settings) => {
	if (settings.LevelPlugin == false) return;
	// Get user
	let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	if (!user) {
		user = message.author;
	}
	// Retrieve Rank from databse
	Ranks.findOne({
		userID: user.id,
		guildID: message.guild.id,
	}, (err, Xp) => {
		if(err) console.log(err);
		const embed = new Discord.MessageEmbed()
			.setAuthor(user.username);
		if (Xp == null) {
			// They haven't sent any messages yet
			embed.addField('Xp:', '0', true);
			embed.addField('Level:', '1', true);
			embed.setFooter('50 XP till level up', user.displayAvatarURL());
		} else {
			// Show users Rank
			embed.addField('Xp:', Xp.Xp, true);
			embed.addField('Level:', Xp.Level, true);
			embed.setFooter(`${(Xp.Level * 50) - Xp.Xp} XP till level up`, message.author.displayAvatarURL());
		}
		message.channel.send(embed);
	});
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
