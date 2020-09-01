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
	//Check if a user was kicked
	const fetchedLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK'
	})
	const log = fetchedLogs.entries.first()
	if (!log) return bot.logger.log(`${member.user} has left the server: [${member.guild.id}]`)
	//console.log(log)
	const { executor, target, reason } = log
	reason == null ? reason : "No reason Given"
	if (target.id === member.id) {
		//User was kicked
		bot.logger.log(`${member.user.tag} was kicked from server: [${member.guild.id}]`);
		//Displays message of kicking player
		var embed = new Discord.MessageEmbed()
		.setColor(15158332)
		.setAuthor(`[KICK] ${target.username}#${target.discriminator}`, `${(target.avatar) ? `https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${target.discriminator % 5}.png`}`)
		.addField("User:", `${target}`, true)
		.addField("Moderator:", `<@${executor.id}>`,true)
		.addField("Reason:", reason)
		.setTimestamp()
		await target.send(`You got kicked from **${member.guild.name}** by ${executor.username}\n Reason: \`${reason}\``)
		let kickChannel = member.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)
		if (kickChannel) kickChannel.send(embed)
	} else {
		//User just left
		bot.logger.log(`${member.user.tag} left the guild, audit log fetch was inconclusive.`);
		//Welcome plugin
		if (settings.welcomePlugin == true) {
			if (settings.welcomeGoodbye == true) {
				if (member.guild.channels.cache.find(channel => channel.name == settings.welcomeChannel)) {
					member.guild.channels.cache.find(channel => channel.name == settings.welcomeChannel).send(settings.welcomeGoodbyeMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.log(e.message, 'error'))
				}
			}
		}
		//Logging plugin
		if (settings.ModLog == true) {
			if (member.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel)) {
				var embed = new Discord.MessageEmbed()
				.setTitle('USER LEFT')
				.setThumbnail(`${(member.user.avatar) ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`}`)
				.addField('User tag:', member.user.tag)
				.addField('User ID:', member.user.id)
				.setTimestamp()
				.setFooter(`Member Count: ${member.guild.members.size}`)
				member.guild.channels.cache.find(channel => channel.name == settings.ModLogChannel).send(embed).catch(e => bot.logger.log(e.message, 'error'))
			}
		}
	}
}
