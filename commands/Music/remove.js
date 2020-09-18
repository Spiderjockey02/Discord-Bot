module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return
	//Check to see if there are any songs in queue/playing
	let fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send("There are currently no songs playing in this server.");
	//Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send("Sorry, you currently aren't in the same channel as me.");
  //Find what to remove
  if (args.length == 0) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('remove').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
  //Position
  if (!isNaN(args[0])) {
		if (args[0] == 0 || args[0] >= fetched.queue.length) return message.channel.send('YOu')
		//Remove item from queue (also check to make sure args[0] is not greater than queue length and is not current song)
		message.channel.send({embed:{color:3066993, description:`${bot.config.emojis.tick} Successfully removed \`${fetched.queue[args[0]].title}\` from queue.`}})
		fetched.queue.splice(args[0], 1)
  } else return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('remove').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
}
module.exports.config = {
	command: "remove",
	aliases: ["remove"]
}
module.exports.help = {
	name: "remove",
	category: "Music",
	description: "Remove song(s) from the queue",
	usage: '!remove [position]',
}
