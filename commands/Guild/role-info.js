const Discord  = require('discord.js')
const moment = require('moment');
module.exports.run = async (bot, message, args, settings) => {
  //Check to see if a role was mentioned
  role =  message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
	//Make sure a role was
	if (!role) {
    if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I was unable to find this role.`}}).then(m => m.delete({ timeout: 10000 }))
    return
  }
  var embed = new Discord.MessageEmbed()
  	.setColor(role.color)
  	.setAuthor(`${message.author.username}#${message.author.discriminator}`, `${(message.author.avatar) ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${message.author.discriminator % 5}.png`}`)
  	.setDescription(`Role | ${role.name}`)
  	.addField("Members:", role.members.size, true)
  	.addField("Color:", role.hexColor, true)
  	.addField("Position:", role.position, true)
  	.addField("Mention:", `<@${role.id}>`, true)
  	.addField("Hoisted:", role.hoist, true)
  	.addField("Mentionable:", role.mentionable, true)
  	.addField("Key permissions:","Does stuff")
  	.addField("Created at", moment(role.createdAt).format('lll'))
  	.setTimestamp()
  	.setFooter(`${message.author.username} | Role ID: ${role.id}`)
  message.channel.send(embed)
};
module.exports.config = {
	command: "role-info",
  aliases: ["roleinfo"]
}
module.exports.help = {
	name: "Role info",
	category: "Guild",
	description: "Gets information on a role",
	usage: '!role-info {role}',
}
