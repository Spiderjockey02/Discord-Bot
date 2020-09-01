const fetch = require('node-fetch');
const Discord = require("discord.js")
module.exports.run = async (bot, message, args, settings) => {
  //Get information on twitch accounts
  if (!args[0]) return message.channel.send(`Please enter a Twitch username`);
  var r = await message.channel.send("Gathering account details...");
  var embed = new Discord.MessageEmbed()
  .setColor(10181046)
  .setTitle(`${args[0]}`)
	.setURL(`https://www.twitch.tv/${args[0]}`)
  message.channel.send(embed)
  console.log(bot.config.TwitchAPI)
  var res = await fetch(`https://api.twitch.tv/helix/users?login=${args[0]}`, {
    method: 'GET',
    Authorization: `${bot.config.TwitchAPI}`
  }).then(res => res.json())
  console.log(res)
}
module.exports.config = {
	command: "twitch",
  aliases: ["twitch"]
}
module.exports.help = {
	name: "Twitch",
	category: "Search",
	description: "Gets information on a twitch account",
	usage: '!twitch [user]',
}
