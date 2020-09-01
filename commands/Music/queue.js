var toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}

module.exports.run = async (bot, message, args, settings, ops) => {
  if (settings.MusicPlugin == false) return
	//Check to see if there are any songs in queue/playing
	let fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send("There are currently no songs playing in this server..");

	//Variables
	let queue = fetched.queue;
  if (queue.length == 0) return message.channel.send("There are currently no songs playing in this server.");
  //console.log(fetched.dispatcher.time)
	//Now playing Line
	//Loop to show all songs in queue
	//check if there is more than 2 songs in queue if not just show 'Now playing'
  var left = queue[0].duration
  var seek = (fetched.connection.dispatcher.streamTime - fetched.connection.dispatcher.pausedTime) / 1000;
  console.log(left)
  console.log(seek)
  var left = left - seek
	let resp = "```ml\n"
  resp += "\t⬐ current track   \n"
  resp += `0) ${queue[0].songTitle} ${new Date(left * 1000).toISOString().substr(11, 8)} left\n`
  resp += "\t⬑ current track \n"
	for (var i = 1; i < 10; i++) {
		if (queue[i] != undefined) {
			resp += `${i}) ${queue[i].songTitle} ${toHHMMSS(queue[i].duration)}\n`
		}
	}
  if (queue.length < 10) {
    resp += `\n\tThis is the end of the queue!\n\tUse ${settings.prefix}play to add more :^)\n`
  }
  resp += "```"
	//Displays message
  let msg;
  let x = 0
	msg = await message.channel.send(resp).then(async function(message) {
    await message.react('⏬')
		await message.react('🔽')
		await message.react('🔼')
		await message.react('⏫')
    const filter = (reaction, user) => {
           return ['⏬','🔽','🔼','⏫'].includes(reaction.emoji.name) && !user.bot
    };
    const collector = message.createReactionCollector(filter, { time: 240000 });
    collector.on('collect', (reaction, reactionCollector) => {
      //find what reaction was done
      if (reaction.emoji.name === '⏬') {
        console.log("Double down")
        //This will show the last 10 songs (in queue)
        let resp = "```ml\n"
        if (queue.length < 10) {
          resp += "\t⬐ current track   \n"
          resp += `0) ${queue[0].songTitle} ${toHHMMSS(queue[0].duration)} left\n`
          resp += "\t⬑ current track \n"
        }
      	for (var i = (queue.length-9); i < queue.length; i++) {
      		if (queue[i] != undefined) {
            console.log(queue[i].songTitle)
      			resp += `${i}) ${queue[i].songTitle} ${toHHMMSS(queue[i].duration)}\n`
      		}
      	}
        resp += `\n\tThis is the end of the queue!\n\tUse ${settings.prefix}play to add more :^)\n`
        resp += "```"
        message.edit(resp)
      } else if (reaction.emoji.name === '🔽') {
        //Show next 10 songs
        console.log("single down")
      } else if (reaction.emoji.name === '🔼') {
        //show the last 10 previous songs
        console.log("single up")
      } else {
        //This will show the first 10 songs (in queue)
        console.log("Double up")
        let resp = "```ml\n"
        resp += "\t⬐ current track   \n"
        resp += `0) ${queue[0].songTitle} ${toHHMMSS(queue[0].duration)} left\n`
        resp += "\t⬑ current track \n"
      	for (var i = 1; i < 10; i++) {
      		if (queue[i] != undefined) {
      			resp += `${i}) ${queue[i].songTitle} ${toHHMMSS(queue[i].duration)}\n`
      		}
      	}
        if (queue.length < 10) {
          resp += `\n\tThis is the end of the queue!\n\tUse ${settings.prefix}play to add more :^)\n`
        }
        resp += "```"
        message.edit(resp)
      }
    });
	})
}
module.exports.config = {
	command: "queue",
	aliases: ["que"]
}
module.exports.help = {
	name: "queue",
	category: "Music",
	description: "Displays the queue",
	usage: '!queue',
}
