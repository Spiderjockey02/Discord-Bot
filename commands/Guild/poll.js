const Discord = require('discord.js');
module.exports.run = async (bot, message, args, settings) => {
	if (!message.member.hasPermission('MANAGE_MESSAGES')) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`MANAGE_MESSAGES\`.`}}).then(m => m.delete({ timeout: 10000 }))
    return
  }
	//Check bot for add reaction permission
	if (!message.guild.me.hasPermission("ADD_REACTIONS")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`ADD_REACTIONS\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}]`)
		return
	}
  if (!args[0]) {
		if (message.deletable) message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('poll').help.usage}\`.`}}).then(m => m.delete({ timeout: 3000 }))
    return
  }
	var embed = new Discord.MessageEmbed()
	.setColor(0xffffff)
	.setTitle(`Poll created by ${message.author.username}`)
	.setDescription(args.join(' '))
	.setFooter('React to vote..')
	.setTimestamp()
	if (message.guild.me.permissions.has("SEND_MESSAGES")) {
		let msg = await message.channel.send(embed)
		await msg.react('✅');
		await msg.react('❌');
	}
  if (message.deletable) message.delete({timeout: 1000})
}
module.exports.config = {
	command: "poll",
	aliases: ["poll"]
}
module.exports.help = {
	name: "Poll",
	category: "Guild",
	description: "Will create a poll for users to answer",
	usage: '!poll [question]',
}
