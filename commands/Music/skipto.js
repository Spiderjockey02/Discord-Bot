module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return
	//Check to see if anythign else was entered with the command
	if (!args[0]) return message.channel.send("Please enter a position in the queue for me to play.")
	//Check to see if any songs are playing
	let fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send("There are currently no songs playing in this server.")
  //Check to see if user is in the same channel as the bot
	if (message.member.voiceChannel !== message.guild.me.voiceChannel) return message.channel.send("Sorry, you currently aren't in the same channel as the bot");
	//Get position
	if (args[0] < 1 || args[0] >= fetched.queue.length) {
    message.channel.send(`Please choose a number from \`1 to ${fetched.queue.length}\``)
  } else {
		fetched.queue.splice(0, args[0] - 1);
	  fetched.dispatcher.end();
	}
}
module.exports.config = {
	command: "skipto",
	aliases: ["goto"]
}
module.exports.help = {
	name: "skipto",
	category: "Music",
	description: "Skips to a particular song in the queue.",
	usage: '!skipto [position]',
}
