module.exports.run = async (bot, message, args, settings) => {
	if (!args[0]) {
		message.channel.send("Please add a message for me to say").then(m => m.delete({ timeout: 3500 }))
	}
	var msg = message.content.slice(5)
	if (message.deletable) message.delete()
	message.channel.send(msg)
}
module.exports.config = {
	command: "say",
	aliases: ["say"]
}
module.exports.help = {
	name: "Say",
	category: "Fun",
	description: "copies what the user said",
	usage: `!say {message}`,
}
