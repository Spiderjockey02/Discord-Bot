module.exports.run = async (bot, message, args, settings, ops) => {
	//Check if author is connected to a voice channel
	if (settings.MusicPlugin == false) return
	//Check if bot is connected to a voice channel
	if (!message.guild.me.voice.channel) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am currently not connected to a voice channel.`}}).then(m => m.delete({ timeout: 10000 }))
	//Check if the author and the bot are in the same channel
	if (message.guild.me.voice.channel !== message.member.voice.channel) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You must be in the same voice channel as me to do that.`}}).then(m => m.delete({ timeout: 10000 }))
	//Leave channel
	message.guild.me.voice.channel.leave()
	//Send messsage
	message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} I have successfully left the channel.`}}).then(m => m.delete({ timeout: 3000 }))
	//Delete the queue for server
	ops.active.delete(message.guild.id)
}
module.exports.config = {
	command: "leave",
	aliases: ["dc", "disconnect"]
}
module.exports.help = {
	name: "leave",
	category: "Music",
	description: "Leaves the channel",
	usage: '!leave',
}
