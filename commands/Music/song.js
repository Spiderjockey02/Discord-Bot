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
  if (settings.MusicPlugin == false) return
	let fetched = ops.active.get(message.guild.id);
	if (fetched == undefined) return message.channel.send(`There are currently no songs playing.`)
  var embed = new Discord.MessageEmbed()
  .setThumbnail(`https://img.youtube.com/vi/${fetched.queue[0].Id}/maxresdefault.jpg`)
  .addField('Playing:', `[${fetched.queue[0].songTitle}](${fetched.queue[0].url})`)
  .addField('Duration', `${toHHMMSS(fetched.dispatcher.time/1000)}/${toHHMMSS(fetched.queue[0].duration)}`)
	message.channel.send(embed)
}
module.exports.config = {
	command: "song",
	aliases: ["np"]
}
module.exports.help = {
	name: "song",
	category: "Music",
	description: "Displays the current song playing.",
	usage: '!song',
}
