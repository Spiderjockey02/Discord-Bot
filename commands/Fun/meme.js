const randomPuppy = require("random-puppy");
const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
	const subReddit = ["dankmeme", "meme", "me_irl", "2meirl4meirl", "deepfriedmemes"];
	const random = subReddit[Math.floor(Math.random() * subReddit.length)];
	const img = await randomPuppy(random);
	var embed = new Discord.MessageEmbed()
	.setTitle(`From /r/${random}`)
	.setURL(`https://reddit.com/r/${random}`)
	.setImage(img);
	//Make sure bot has the right permissions
  message.channel.send(embed)
}
module.exports.config = {
	command: "meme",
	aliases: ["meme"],
}
module.exports.help = {
	name: "Meme",
	category: "Fun",
	description: "Sends a meme",
	usage: '!meme',
}
