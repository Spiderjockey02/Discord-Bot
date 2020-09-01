module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return
	//Check to see if there are any songs in queue/playing
	let fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send("There are currently no songs playing in this server.");
	//Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send("Sorry, you currently aren't in the same channel as the bot");
	//Send message
	message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Successfully skipped song.`}}).then(m => m.delete({ timeout: 5000 }))
	//Run finish event and return
	return fetched.dispatcher.emit('end')
}
module.exports.config = {
	command: "skip",
	aliases: ["skip"]
}
module.exports.help = {
	name: "skip",
	category: "Music",
	description: "Skips the current song",
	usage: '!skip',
}
