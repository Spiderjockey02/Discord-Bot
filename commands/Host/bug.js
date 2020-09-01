const Discord = require('discord.js')
const { Bug } = require('../../modules/models')
module.exports.run = async (bot, message, args, settings) => {
	if (message.deletable) message.delete()
	if (args.length == 0) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('bug').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	//add bug
	const newBug = new Bug({
		guildID: message.guild.id,
		guildName: message.guild.name,
		userID: message.author.id,
		userName: message.author.username,
		reason: message.content.slice(5)
	})
	newBug.save().catch(e => console.log(e))
	//reply to user
	message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} Bug reported has been successfully created.`}}).then(m => m.delete({ timeout: 8000 }))
}
module.exports.config = {
	command: "bug",
	aliases: ["bug"]
}
module.exports.help = {
	name: "bug",
	category: "Host",
	description: "Report a bug to Egglord",
	usage: '!bug [issue]',
}
