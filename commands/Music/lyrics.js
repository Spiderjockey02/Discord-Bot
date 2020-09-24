const { KSoftClient } = require('@ksoft/api');
const Discord = require('discord.js');

// page calculator
function Page(page, message, results) {
	if (page == 0) {
		const embed = new Discord.MessageEmbed()
			.setColor(2067276)
			.setTitle(results.name)
			.setURL(results.url)
			.setDescription(results.lyrics.substring(0, 2048))
			.setTimestamp()
			.setFooter('Provided by KSOFT.API');
		message.edit(embed);
	} else {
		const num1 = (page * 2048);
		const num2 = num1 + 2048;
		const embed = new Discord.MessageEmbed()
			.setColor(2067276)
			.setTitle(results.name)
			.setURL(results.url)
			.setDescription(results.lyrics.substring(num1, num2))
			.setTimestamp()
			.setFooter('Provided by KSOFT.API');
		message.edit(embed);
	}
}

module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} This plugin is currently disabled.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	let song;
	if (!args[0]) {
		// GET current song that is playing
		const fetched = ops.active.get(message.guild.id);
		if (fetched == undefined) {
			if (message.deletable) message.delete();
			return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} There are no songs currently playing.` } }).then(m => m.delete({ timeout: 10000 }));
		} else {
			song = fetched.queue[0].title;
		}
	} else {
		song = message.content.slice(8);
	}
	const ksoft = new KSoftClient(bot.config.KSoftSiAPI);
	try {
		const results = await ksoft.lyrics.get(song, { textOnly: true });
		console.log(results);
		// Must make sure that description is less than 2048 characters
		const embed = new Discord.MessageEmbed()
			.setColor(2067276)
			.setTitle(results.name)
			.setURL(results.url)
			.setDescription(results.lyrics.substring(0, 2048))
			.setTimestamp()
			.setFooter('Provided by KSOFT.API');
		await message.channel.send(embed).then(async function(msg) {
			if (results.lyrics.length < 2048) return;
			// Make sure bot has permissions to add reactions
			if (!msg.guild.me.hasPermission('ADD_REACTIONS')) {
				msg.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`ADD_REACTIONS\`.` } }).then(m => m.delete({ timeout: 10000 }));
				bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}]`);
				return;
			}
			// send reactions so user can see more lyrcis
			await msg.react('⬆');
			await msg.react('⬇');
			// get collector
			let page = 0;
			const filter = (reaction, user) => {
				return ['⬆', '⬇'].includes(reaction.emoji.name) && !user.bot;
			};
			const collector = msg.createReactionCollector(filter, { time: 240000 });
			collector.on('collect', (reaction) => {
				const totalpages = (Math.ceil(results.lyrics.length / 2048) - 1);
				if (reaction.emoji.name === '⬆') {
					// back page
					page = page - 1;
					if (page <= 0) page = 0;
					if (page >= totalpages) page = totalpages;
					Page(page, msg, results);
				} else {
					// forward page
					page = page + 1;
					if (page <= 0) page = 0;
					if (page >= totalpages) page = totalpages;
					Page(page, msg, results);
				}
			});
		});
	} catch(e) {
		message.channel.send(`An error occured: ${e.message}`);
	}
};
module.exports.config = {
	command: 'lyrics',
	aliases: ['lyrics'],
};
module.exports.help = {
	name: 'lyric',
	category: 'Music',
	description: 'Get lyrics on the current song playing.',
	usage: '!lyrics [song -optional]',
};
