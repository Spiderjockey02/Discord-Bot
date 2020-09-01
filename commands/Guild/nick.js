module.exports.run = async (bot, message, args, settings) => {
	//Get
	var nickuser =  message.guild.member((message.mentions.users.first()) ? message.mentions.users.first() : message.author)
	if (nickuser == message.author) {
		if (!message.member.hasPermission("CHANGE_NICKNAMES")) {
			message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`CHANGE_NICKNAMES\`.`}}).then(m => m.delete({ timeout: 10000 }))
			return
		}
	} else {
		if (!message.member.hasPermission("MANAGE_NICKNAMES")) {
			message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`MANAGE_NICKNAMES\`.`}}).then(m => m.delete({ timeout: 10000 }))
			return
		}
	}

	if (!message.guild.me.hasPermission("MANAGE_NICKNAMES")) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MANAGE_NICKNAMES\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`MANAGE_NICKNAMES\` in [${message.guild.id}]`)
		return
	}

	console.log(args)
	if (args.length == 0) {
			message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please enter a nickname.`}}).then(m => m.delete({ timeout: 10000 }))
			return
	}
	//Make sure the user is not owner of server
	nickname = message.content.slice(6).replace(/<[^}]*>/,'').slice(1)
	//Make sure nickname is longer than 32 characters
	if (nickname.length >= 32) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Nickname must be shorter than 32 characters.`}}).then(m => m.delete({ timeout: 5000 }))
		return
	}

	//Change nickname and tell user (send error message if dosen't work)
	try {
		nickuser.setNickname(nickname)
		message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} *Successfully changed nickname of ${nickuser.user.username}#${nickuser.user.discriminator}.*`}}).then(m => m.delete({ timeout: 5000}))
		if (message.deletable) message.delete()
	} catch(e) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am unable to change ${nickuser.user.username}#${nickuser.user.discriminator} nickname.`}}).then(m => m.delete({ timeout: 10000 }))
	}
}
module.exports.config = {
	command: "nick",
	aliases: ["nick"]
}
module.exports.help = {
	name: "Nick",
	category: "Guild",
	description: "Nickname a user",
	usage: `!nick {user} [name]`,
}
