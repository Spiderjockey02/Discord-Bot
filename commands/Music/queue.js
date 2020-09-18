const Discord = require('discord.js')

//queue page calculator
function Page(page, message, queue, fetched) {
  var left = queue[0].duration
  var seek = (fetched.connection.dispatcher.streamTime - fetched.connection.dispatcher.pausedTime) / 1000;
  var left = left - seek

  var songs = page * 10
  let resp = "```ml\n"
  for (var i = (songs - 10); i < songs; i++) {
    if (i == 0 & songs == 10) {
      resp += "\t⬐ current track   \n"
      resp += `0) ${queue[0].title} ${new Date(left * 1000).toISOString().substr(11, 8)} left\n`
      resp += "\t⬑ current track \n"
    }
    //make song has been found
    if (queue[i] != undefined) {
      resp += `${i}) ${queue[i].title} ${require('../../Utils/time.js').toHHMMSS(queue[i].duration)}\n`
    }
  }
  resp += "```"
  message.edit(resp)
}
module.exports.run = async (bot, message, args, settings, ops) => {
  if (settings.MusicPlugin == false) return
	//Check to see if there are any songs in queue/playing
	let fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send("`There are currently no songs playing in this server..`");

	//Check and get queue
	let queue = fetched.queue;
  if (queue.length == 0) return message.channel.send("`There are currently no songs playing in this server.`");
  //console.log(queue) //-debugging

  //get current track time left
  var left = queue[0].duration
  var seek = (fetched.connection.dispatcher.streamTime - fetched.connection.dispatcher.pausedTime) / 1000;
  var left = left - seek

	let resp = "```ml\n"
  resp += "\t⬐ current track   \n"
  resp += `0) ${queue[0].title} ${new Date(left * 1000).toISOString().substr(11, 8)} left\n`
  resp += "\t⬑ current track \n"
	for (var i = 1; i < 10; i++) {
		if (queue[i] != undefined) {
			resp += `${i}) ${queue[i].title} ${require('../../Utils/time.js').toHHMMSS(queue[i].duration)}\n`
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
    var page = 1
    const collector = message.createReactionCollector(filter, { time: 240000 });
    collector.on('collect', (reaction, reactionCollector) => {
      //find what reaction was done
      var totalPage = Math.ceil(queue.length/10)
      if (reaction.emoji.name === '⏬') {
        //last page
        page = totalPage
        Page(page, message, queue, fetched)
      } else if (reaction.emoji.name === '🔽') {
        //Show next 10 songs
        page = page + 1
        if (page <= 0) page = 0
        if (page >= totalPage) page = totalPage
        Page(page, message, queue, fetched)
      } else if (reaction.emoji.name === '🔼') {
        //show the last 10 previous songs
        page = page - 1
        if (page <= 0) page = 0
        if (page >= totalPage) page = totalPage
        Page(page, message, queue, fetched)
      } else {
        //This will show the first 10 songs (in queue)
        page = 1
        Page(page, message, queue, fetched)
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
