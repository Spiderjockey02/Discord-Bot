const Discord = require('discord.js')
const arraySort = require('array-sort')
const table = require('table')
module.exports.run = async (bot, message, args, settings) => {
	//Make sure bot can see invites
	if (message.guild.me.hasPermission("MANAGE_GUILD")) {
		let invites = await message.guild.fetchInvites()
		invites = invites.array()
		arraySort(invites, 'uses', {reverse: true})
		let possibleInvite = [['Users', 'Uses']]
		invites.forEach(function(invite) {
			possibleInvite.push([invite.inviter.username, invite.uses])
		})
		var embed = new Discord.MessageEmbed()
		.setColor(0x7289da)
		.setTitle('Server Invites')
		.addField('Leaderboard:', `\`\`\`${table.table(possibleInvite)}\`\`\``)
		message.channel.send(embed)
	} else {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`MANAGE_GUILD\`.`}}).then(m => m.delete({ timeout: 30000 }))
		bot.logger.error(`Missing permission: \`MANAGE_GUILD\` in [${message.guild.id}]`)
	}
}
module.exports.config = {
	command: "invites",
  aliases: ["inv", "invite"]
}
module.exports.help = {
	name: "Invite Leaderboard",
	category: "Fun",
	description: "Displays the Server Invite leaderboard",
	usage: '!invites',
}
