// Dependencies
const Discord = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message, args, emojis) => {
	// Check to see if a role was mentioned
	const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
	// Make sure it's a role on the messages's server
	if (!role) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this role.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Send information to channel
	const embed = new Discord.MessageEmbed()
		.setColor(role.color)
		.setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
		.setDescription(`Role | ${role.name}`)
		.addField('Members:', role.members.size, true)
		.addField('Color:', role.hexColor, true)
		.addField('Position:', role.position, true)
		.addField('Mention:', `<@${role.id}>`, true)
		.addField('Hoisted:', role.hoist, true)
		.addField('Mentionable:', role.mentionable, true)
		.addField('Key permissions:', 'Does stuff')
		.addField('Created at', moment(role.createdAt).format('lll'))
		.setTimestamp()
		.setFooter(`${message.author.username} | Role ID: ${role.id}`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'role-info',
	aliases: ['roleinfo'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Role info',
	category: 'Guild',
	description: 'Get information on a role.',
	usage: '${PREFIX}role-info <role>',
};
