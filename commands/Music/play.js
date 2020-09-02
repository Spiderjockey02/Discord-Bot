//Dependencies
const ytdl = require('ytdl-core-discord');
//const ytdl = require('ytdl-core')
const streamOptions = { seek: 0, volume: 0.5, quality: 'highestaudio', highWaterMark:50, filter: 'audioonly', type: 'opus'};
const Discord = require('discord.js')
const config = require("../../config.js");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(config.YoutubeAPI_Key);
const scdl = require("soundcloud-downloader");
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
  //RegEx
  const search = args.join(" ");
  const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi
  const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi
  const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/
  const url = args[0]
  const urlValid = videoPattern.test(args[0])

  // Start the playlist if playlist url was provided
  if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
    return require('./add-playlist.js').run(bot, message, args, settings, ops)
  }
  //find youtube or soudcloud video
  let songInfo = null;
  let song = null;
  if (urlValid) {
    //Check Youtube
    try {
      songInfo = await ytdl.getInfo(url)
      song = {
        songTitle: songInfo.title,
		    requester: message.author.tag,
		    url: args[0],
		    announceChannel: message.channel.id,
		    Id: songInfo.player_response.videoDetails.videoId,
		    duration: songInfo.player_response.videoDetails.lengthSeconds
      }
    } catch (e) {
      bot.logger.error(e)
      return message.channel.send("An error has occured.").then(m => m.delete({ timeout: 5000 }))
    }
  } else if (scRegex.test(url)) {
    //Check soundcloud
    try {
      const trackInfo = await scdl.getInfo(url, config.soundcloudAPI_Key);
        song = {
          title: trackInfo.title,
          requester: message.author.tag,
          url: trackInfo.permalink_url,
          announceChannel: message.channel.id,
          duration: trackInfo.duration / 1000
        };
    } catch (e) {
      if (e.statusCode === 404) {
        return message.reply("Could not find that Soundcloud track.")
      }
      return message.reply("There was an error playing that Soundcloud track.")
    }
  } else {
    //Search for Video
    try {
      const results = await youtube.searchVideos(search, 1);
      songInfo = await ytdl.getInfo(results[0].url);
      song = {
        songTitle: songInfo.title,
		    requester: message.author.tag,
		    url: args[0],
		    announceChannel: message.channel.id,
		    Id: songInfo.player_response.videoDetails.videoId,
		    duration: songInfo.player_response.videoDetails.lengthSeconds
      };
    } catch (e) {
      console.error(e);
      return message.reply("No video was found with a matching title").catch(console.error);
    }
  }
  //join voice channel and set up queue
  let data = ops.active.get(message.guild.id) || {}
  if (!data.connection) data.connection = await message.member.voice.channel.join()
  data.connection.voice.setSelfDeaf(true)
  if (!data.queue) data.queue = []
  data.guildID = message.guild.id
  data.queue.push(song)
  if (!data.dispatcher) {
    play(bot, ops, data)
  } else {
    var embed = new Discord.MessageEmbed()
		  .setTitle("Added to queue")
		  .setDescription(`[${song.songTitle}](${song.url})`)
      if (song.Id) {
        embed.setThumbnail(`https://img.youtube.com/vi/${info.player_response.videoDetails.videoId}/maxresdefault.jpg`)
        embed.addField("Channel:", `[${info.author.name}]`, true)
      }
		  embed.addField("Song duration:", `${toHHMMSS(song.duration)}`, true)
		  embed.addField("Posititon in Queue:", `${data.queue.length}`, true)
		message.channel.send(embed)
  }
  ops.active.set(message.guild.id, data)
  console.log(ops)
}
module.exports.config = {
	command: "play",
	aliases: ["p"]
}
module.exports.help = {
	name: "play",
	category: "Music",
	description: "Plays a song",
	usage: '!play [link | song name]',
}
