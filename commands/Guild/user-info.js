const Discord = require("discord.js");
const moment = require('moment');
module.exports.run = async (bot, message, args, settings) => {
  //Get user
  var user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author
  const member = message.guild.member(user)
  //Get emoji (for status)
  if (member.presence.status == 'online') {
    emoji = "🟢"
  } else if (member.presence.status == 'idle') {
    emoji = "🟡"
  } else if (member.presence.status == 'offline') {
    emoji = "⚫"
  } else {
    emoji = "🔴"
  }
  //Display user informaion
  var embed = new Discord.MessageEmbed()
  .setAuthor(`User info for ${member.user.username}#${member.user.discriminator}`, `${(member.user.avatar) ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`}`)
  .setThumbnail(`${(member.user.avatar) ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`}`)
  .addField("Nickname:", member.nickname != null ? member.nickname : "-", true)
  .addField("Status", `${emoji} ${member.presence.status}`, true)
  .addField("📋Joined Discord", moment(member.user.createdAt).format('lll'), true)
  .addField("📋Joined Server", moment(member.joinedAt).format('lll'), true)
  .addField(`Roles [${member.roles.cache.size}]`, member.roles.cache.map(roles => roles).join(', '), true)
  .addField("Activity", (user.presence.game) ? user.presence.game.name : '-', true)
  .setTimestamp()
  .setFooter(`Requested by ${message.author.username}`)
  message.channel.send(embed)
};
module.exports.config = {
	command: "user-info",
  aliases: ["userinfo"]
}
module.exports.help = {
	name: "User info",
	category: "Guild",
	description: "Gets information on a user",
	usage: '!user-info {user}',
}
