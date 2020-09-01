//Dependencies
const Discord = require('discord.js');

module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return  //makes sure its not this bot
	//get server settings
	let settings;
	try {
		settings = await bot.getGuild(member.guild)
	} catch (e) {
		console.log(e)
	}
	bot.logger.log(`${member.user.tag} has joined the server: [${member.guild.id}]`)
	if (settings.welcomePlugin == true) {
		//Send message to channel
		if (member.guild.channels.cache.find(channel => channel.name == settings.welcomeChannel)) {
			member.guild.channels.cache.find(channel => channel.name == settings.welcomeChannel).send(settings.welcomeMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message))
		}
		//Send private message to user
		if (settings.welcomePvt == true) {
			member.send(settings.welcomePvtMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message))
		}
		//Add role to user
		if (settings.welcomeRole == true) {
			for (roles in settings.welcomeRoleGive) {
				if (member.guild.roles.cache.find(role => role.name == roles)) member.addrole(member.guild.roles.find(role => role.name === roles)).catch(e => bot.logger.error(e.message))
			}
		}
	}
	//Logging plugin
	if (settings.ModLog == true) {
		if (member.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)) {
			var embed = new Discord.MessageEmbed()
			.setTitle('USER JOIN')
			.setThumbnail(`${(member.user.avatar) ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`}`)
			.addField('User tag:', member.user.tag)
			.addField('User ID:', member.user.id)
			.setTimestamp()
			.setFooter(`Member Count: ${member.guild.members.size}`)
			member.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send(embed).catch(e => bot.logger.error(e.message))
		}
	}
}
