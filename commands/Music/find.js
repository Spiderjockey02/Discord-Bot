const yts = require('yt-search')
var { getData, getPreview } = require("spotify-url-info");

module.exports.run = async (bot, message, args, settings, ops) => {
	//make sure music plugin is enabled
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.`}}).then(m => m.delete({ timeout: 10000 }))
		return;
	}
	if (args.length == 0) return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('find').help.usage}\`.`}}).then(m => m.delete({ timeout: 5000 }))
	let commandFile = require('./play.js')
	//Check for spotify, youtube, soundcloud etc
	if (args[0].includes('https://open.spotify.com/')) {
		//This checks for spotify
		console.log("Youtube")
	} else if (message.content.includes('search')) {
		//Gets the first 10 entries from youtube with given keywords
		const r = await yts(message.content.slice(8))
		const videos = r.videos.slice(0,10)
		let resp = ''
		for (var i = 0; i < videos.length; i++) {
			resp += `${i+1}.) \`${videos[i].title}\`\n`
		}
		resp += `\n**Choose a number between \`1-${videos.length}\` or \`cancel\`**`;
		//Get response from user
		message.channel.send(resp).then(() => {
			const filter = m => m.content < videos.length+1 && m.content > 0 || m.content == 'cancel';
			message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] }).then(collected => {
				//filter succeeded
				if (collected.first().content.toLowerCase() == 'cancel') {
					message.channel.send(`Search cancelled`)
				} else {
					console.log(message)
					commandFile.run(bot, message, [videos[collected.first().content-1].url], settings, ops)
				}
			}).catch(collected => {
				//an error occured
				message.channel.send('Time ran out');
			})
		})
	} else {
		//Play the first entry from youtube
		console.log("Get first youtube link")
		const r = await yts(message.content.slice(6))
		const videos = r.videos.slice(0, 1)
		commandFile.run(bot, message, [videos[0].url], settings, ops)
	}
}
module.exports.config = {
	command: "find",
	aliases: ["search"]
}
module.exports.help = {
	name: "Find",
	category: "Music",
	description: "Finds for a song",
	usage: '!find [song]',
}
