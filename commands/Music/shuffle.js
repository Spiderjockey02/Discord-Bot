
module.exports.run = async (bot, message, args, settings, ops) => {
  if (settings.MusicPlugin == false) return
  //Get queue
  let fetched = ops.active.get(message.guild.id);
  if (fetched == undefined) return message.channel.send(`There are currently no songs playing.`)  //Checks to see if songs are playing.
  //variables
  let songs = fetched.queue;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
  fetched.queue = songs;
  ops.active.set(message.guild.id, fetched)
  //send message
  message.channel.send("Queue has been shuffled").then(m => m.delete({ timeout: 5000 }))
}
module.exports.config = {
	command: "shuffle",
	aliases: ["shuffle"]
}
module.exports.help = {
	name: "shuffle",
	category: "Music",
	description: "Shuffles up the queue",
	usage: '!shuffle',
}
