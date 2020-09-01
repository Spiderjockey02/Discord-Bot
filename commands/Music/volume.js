module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return
	//Check to see if there are any songs in queue/playing
	let fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send("There are currently no songs playing on this server.");
	//Check to see if user and bot are in the same channel
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send("Sorry, you currently aren't in the same channel as the bot");
	//Check if they inputted a number from 0 to 200 (No MAX but music quality lowers after 200)
	if (isNaN(args[0]) || args[0] > 200 || args[0] < 0) return message.channel.send("Please input a number between 0 and 200")
	//Change the volume
	fetched.dispatcher.setVolume(args[0]/100)
	//Send a message
	message.channel.send(`:loud_sound: Player sound:\`${args[0]}%\``);
}
module.exports.config = {
	command: "volume",
	aliases: ["vol"]
}
module.exports.help = {
	name: "volume",
	category: "Music",
	description: "Sets the volume of the song.",
	usage: '!volume [number]',
}
