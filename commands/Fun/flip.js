module.exports.run = async (bot, message, args, settings) => {
  var choices = ["Head", "Tails"]
  //Make sure bot has the right permissions
  message.channel.send(choices[Math.floor(Math.random() * choices.length)])
}
module.exports.config = {
	command: "flip",
	aliases: ["flip"]
}
module.exports.help = {
	name: "Flip",
	category: "Fun",
	description: "Flips a coin",
	usage: '!flip',
}
