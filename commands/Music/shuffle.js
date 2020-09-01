module.exports.run = async (bot, message, args, settings, ops) => {
  if (settings.MusicPlugin == false) return
  //Get queue
  let fetched = ops.active.get(message.guild.id);
  if (fetched == undefined) return message.channel.send(`There are currently no songs playing.`)  //Checks to see if songs are playing.
  let queue = fetched.queue.shift();
  //Shuffle up queue
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
  await shuffle(queue);
  message.channel.send({embed:{description:"Queue has been shuffled"}})
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
