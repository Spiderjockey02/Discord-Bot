//Dependencies
const ytdl = require('ytdl-core-discord');
//const ytdl = require('ytdl-core')
const streamOptions = { seek: 0, volume: 0.5, quality: 'highestaudio', highWaterMark:50, filter: 'audioonly', type: 'opus'};
const Discord = require('discord.js')

//Time change
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
	//Checks to see if music is enabled or the server
  if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.`}}).then(m => m.delete({ timeout: 10000 }))
		return;
	}
  //Check if bot can see user in channel (the user is in a channel)
  if (!message.member.voice.channelID) {
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} You are not connected to a voice channel.`}}).then(m => m.delete({ timeout: 10000 }))
		message.delete()
		return
	}
  //Check if bot can join channel
  if (!message.guild.me.hasPermission("CONNECT")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`CONNECT\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}]`)
		return
	}
  //Check if bot can speak in channel
  if (!message.guild.me.hasPermission("SPEAK")) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`SPEAK\`.`}}).then(m => m.delete({ timeout: 10000 }))
		bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}]`)
		return
	}
  //Check if an 'entry' was added
  if (args.length == 0) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('play').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
  //Check if it is a youtube link
  let validate = await ytdl.validateURL(args[0])
  if (!validate || message.content.includes('&list=PL')) {
    //It wasn't a youtube link so directed to search.js
    return require('./search.js').run(bot, message, args, settings, ops)
  }
  //Get information on youtube link
  let info = await ytdl.getInfo(args[0])
  let data = ops.active.get(message.guild.id) || {}
  //Join voice channel if not in one
  if (!data.connection) data.connection = await message.member.voice.channel.join()
  data.connection.voice.setSelfDeaf(true)
  if (!data.queue) data.queue = []
  data.guildID = message.guild.id
  //Add song to queue
  data.queue.push({
    songTitle: info.title,
		requester: message.author.tag,
		url: args[0],
		announceChannel: message.channel.id,
		Id: info.player_response.videoDetails.videoId,
		duration: info.player_response.videoDetails.lengthSeconds
  })
  if (!data.dispatcher) {
    play(bot, ops, data)
  } else {
    //Display (reply) youtube information to user
		if (info.author.channel_url) {
			channel_url = info.author.channel_url
		}
		//Display information
		var embed = new Discord.MessageEmbed()
		  .setTitle("Added to queue")
		  .setDescription(`[${info.title}](${info.url})`)
		  .setThumbnail(`https://img.youtube.com/vi/${info.player_response.videoDetails.videoId}/maxresdefault.jpg`)
		  .addField("Channel:", `[${info.author.name}]`, true)
		  .addField("Song duration:", `${toHHMMSS(info.player_response.videoDetails.lengthSeconds)}`, true)
		  .addField("Posititon in Queue:", `${data.queue.length}`, true)
		message.channel.send(embed)
  }
  //add songs to queue
  ops.active.set(message.guild.id, data)
  //Play function (including showing now playing when song changes)
  async function play(bot, ops, data) {
    //Should update message to 'embed' to title, duration and thumbnail
    var embed = new Discord.MessageEmbed()
      .setThumbnail(`https://img.youtube.com/vi/${data.queue[0].Id}/maxresdefault.jpg`)
      .addFields(
          { name: 'Now playing:', value: `[${data.queue[0].songTitle}](${data.queue[0].url})` },
		      { name: 'Duration:', value: `${toHHMMSS(data.queue[0].duration)}` },
      )
	  bot.channels.cache.get(data.queue[0].announceChannel).send(embed).then(m => m.delete({ timeout: info.player_response.videoDetails.lengthSeconds * 1000 }))
	  data.dispatcher = await data.connection.play(await ytdl(data.queue[0].url), streamOptions);
	  data.dispatcher.guildID = data.guildID
	  data.dispatcher.once('finish', function() { finish(bot, ops, this)});
  }
  //Finish function (if song ends and queue isn't empty play next song if not leave channel)
  function finish(bot, ops, dispatcher) {
	   let fetched = ops.active.get(dispatcher.guildID)
	   fetched.queue.shift();
     //Plays next song if there is one
	   if (fetched.queue.length > 0) {
       ops.active.set(dispatcher.guildID, fetched)
		   play(bot, ops, fetched)
	   } else {
       ops.active.delete(dispatcher.guildID)
		   let vc = bot.guilds.cache.get(dispatcher.guildID).me.voice.channel
		   if (vc) vc.leave()
	   }
  }
}
module.exports.config = {
	command: "play",
	aliases: ["play"]
}
module.exports.help = {
	name: "play",
	category: "Music",
	description: "Plays a song",
	usage: '!play [link | song name]',
}
