const randomPuppy = require("random-puppy");
var request = require('request');
module.exports.run = async (bot, message, args, settings) => {
	if (!args[0]) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('reddit').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	var r = await message.channel.send("Getting image..")
	const img = await randomPuppy(args[0]).catch(e => bot.logger.log(`Subreddit: ${args[0]} was requested but got error: ${e.message}.`, 'error'));
	//Check if that subreddit exists
	request({method: 'HEAD', uri:img}, function (error, response, body) {
  	if (!error && response.statusCode == 200) {
    	//Stuff
			const MemeEmbed = {
				title: `From /r/${args[0]}`,
				image: {
					url: `${img}`,
				},
				url: `https://reddit.com/r/${args[0]}`,
				timestamp: new Date(),
				footer: {
						text: `Requested by @${message.author.username}`,
				},
			};
			r.delete()
			message.channel.send({ embed: MemeEmbed })
  	} else {
			r.delete()
			message.delete()
			message.channel.send("That subreddit does not exist").then(m => m.delete({ timeout: 3500 }))
			return
		}
	})
}
module.exports.config = {
	command: "reddit",
	aliases: ["reddit", "redit"]
}
module.exports.help = {
	name: "reddit",
	category: "Search",
	description: "Sends a random image from a chosen subreddit.",
	usage: '!reddit [subreddit]',
}
