// Dependecies
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Make sure the bot is NSFW
	if (bot.config.NSFWBot == false) return;
	// Make sure the message was sent in a NSFW channel
	if (message.channel.nsfw === true || message.channel.type == 'dm') {
		superagent.get('https://nekobot.xyz/api/image')
			.query({ type: 'pussy' })
			.end((err, response) => {
				const embed = new Discord.MessageEmbed()
					.setImage(response.body.message);
				message.channel.send(embed);
			});
	} else {
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${(message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:'} This command can only be done in a \`NSFW\` channel.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'pussy',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'pussy',
	category: 'nsfw',
	description: 'See some cheeky photos',
	usage: '${PREFIX}pussy',
};
