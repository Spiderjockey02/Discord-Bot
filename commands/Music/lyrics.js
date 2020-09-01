const { KSoftClient } = require('ksoft.js');
const Discord = require('discord.js')

//page calculator
function Page(page, message, results) {
	if (page == 0) {
		var embed = new Discord.MessageEmbed()
			.setColor(2067276)
			.setTitle(results.name)
			.setURL(results.url)
			.setDescription(results.lyrics.substring(0, 2048))
			.setTimestamp()
			.setFooter("Provided by KSOFT.API")
		message.edit(embed)
	} else {
		var num1 = (page * 2048)
		var num2 = num1 + 2048
		var embed = new Discord.MessageEmbed()
			.setColor(2067276)
			.setTitle(results.name)
			.setURL(results.url)
			.setDescription(results.lyrics.substring(num1, num2))
			.setTimestamp()
			.setFooter("Provided by KSOFT.API")
		message.edit(embed)
	}
}

module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete()
		message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.`}}).then(m => m.delete({ timeout: 10000 }))
		return;
	}
	if (!args[0]) {
		//GET current song that is playing
		let fetched = ops.active.get(message.guild.id);
		if (fetched == undefined) {
			if (message.deletable) message.delete()
			return message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} There are no songs currently playing.`}}).then(m => m.delete({ timeout: 10000 }))
		} else {
			console.log(fetched.queue[0].songTitle)
			song = fetched.queue[0].songTitle
		}
	} else {
		song = message.content.slice(8)
	}
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	try {
		var results = await ksoft.lyrics.get(`${song}`);
		//Must make sure that description is less than 2048 characters
		var embed = new Discord.MessageEmbed()
			.setColor(2067276)
			.setTitle(results.name)
			.setURL(results.url)
			.setDescription(results.lyrics.substring(0, 2048))
			.setTimestamp()
			.setFooter("Provided by KSOFT.API")
		await message.channel.send(embed).then(async function(message) {
			console.log(results.lyrics.length)
			if (results.lyrics.length < 2048) return
			//Make sure bot has permissions to add reactions
			if (!message.guild.me.hasPermission("ADD_REACTIONS")) {
				message.channel.send({embed:{color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`ADD_REACTIONS\`.`}}).then(m => m.delete({ timeout: 10000 }))
				bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}]`)
				return
			}
			//send reactions so user can see more lyrcis
			await message.react('⬆')
			await message.react('⬇')
			//get collector
			var page = 0
			const filter = (reaction, user) => {
	           return ['⬆', '⬇'].includes(reaction.emoji.name) && !user.bot
	    };
			const collector = message.createReactionCollector(filter, { time: 240000 });
	    collector.on('collect', (reaction, reactionCollector) => {
				var totalpages = (Math.ceil(results.lyrics.length/2048) - 1)
				if (reaction.emoji.name === '⬆') {
					//back page
					page = page - 1
					if (page <= 0) page = 0
					if (page >= totalpages) page = totalpages
					Page(page, message, results)
				} else {
					//forward page
					page = page + 1
					if (page <= 0) page = 0
					if (page >= totalpages) page = totalpages
					Page(page, message, results)
				}
			})
		})
	}
	catch(e) {
		message.channel.send(`An error occured: ${e.message}`)
	}
}
module.exports.config = {
	command: "lyrics",
	aliases: ["lyrics"]
}
module.exports.help = {
	name: "lyric",
	category: "Music",
	description: "Get lyrics on the current song playing.",
	usage: '!lyrics [song -optional]',
}
