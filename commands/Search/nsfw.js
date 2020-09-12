const Discord = require('discord.js')
const { KSoftClient } = require('@ksoft/api');
module.exports.run = async (bot, message, args, settings) => {
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	//Check if its a NSFW channel or not
	if (message.channel.nsfw == false) {
    message.delete()
    message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This command can only be done in a \`NSFW\` channel.`}}).then(m => m.delete({ timeout: 5000 }))
    return
  }
  var pic = await ksoft.images.nsfw();
  var embed = new Discord.MessageEmbed()
    .setTitle(`From /${pic.post.subreddit}`)
    .setURL(pic.post.link)
    .setImage(pic.url)
    .setFooter(`👍 ${pic.post.upvotes}   👎 ${pic.post.downvotes} | Provided by KSOFT.API`)
  message.channel.send(embed)
}
module.exports.config = {
	command: "nsfw",
	aliases: ["nsfw"]
}
module.exports.help = {
	name: "NSFW",
	category: "Search",
	description: "See some cheeky photos",
	usage: '!nsfw',
}
