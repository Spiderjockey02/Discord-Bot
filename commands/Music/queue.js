// queue page calculator
function Page(page, message, queue, fetched) {
	const total = queue[0].duration;
	const seek = (fetched.connection.dispatcher.streamTime - fetched.connection.dispatcher.pausedTime) / 1000;
	const left = total - seek;

	const songs = page * 10;
	let resp = '```ml\n';
	for (let i = (songs - 10); i < songs; i++) {
		if (i == 0 & songs == 10) {
			resp += '\t⬐ current track   \n';
			resp += `0) ${queue[0].title} ${new Date(left * 1000).toISOString().substr(11, 8)} left\n`;
			resp += '\t⬑ current track \n';
		}
		// make song has been found
		if (queue[i] != undefined) {
			resp += `${i}) ${queue[i].title} ${require('../../Utils/time.js').toHHMMSS(queue[i].duration)}\n`;
		}
	}
	resp += '```';
	message.edit(resp);
}

module.exports.run = async (bot, message, args, emojis, settings, ops) => {
	// Check to see if there are any songs in queue/playing
	const fetched = ops.active.get(message.guild.id);
	if (!fetched) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} There are currently no songs playing in this server.` } }).then(m => m.delete({ timeout: 5000 }));

	// Check and get queue
	const queue = fetched.queue;
	if (queue.length == 0) return message.channel.send('`There are currently no songs playing in this server.`');
	// console.log(queue) //-debugging

	// get current track time left
	const total = queue[0].duration;
	const seek = (fetched.connection.dispatcher.streamTime - fetched.connection.dispatcher.pausedTime) / 1000;
	const left = total - seek;

	let resp = '```ml\n';
	resp += '\t⬐ current track   \n';
	resp += `0) ${queue[0].title} ${new Date(left * 1000).toISOString().substr(11, 8)} left\n`;
	resp += '\t⬑ current track \n';
	for (let i = 1; i < 10; i++) {
		if (queue[i] != undefined) {
			resp += `${i}) ${queue[i].title} ${require('../../Utils/time.js').toHHMMSS(queue[i].duration)}\n`;
		}
	}
	if (queue.length < 10) {
		resp += `\n\tThis is the end of the queue!\n\tUse ${settings.prefix}play to add more :^)\n`;
	}
	resp += '```';
	// Displays message
	message.channel.send(resp).then(async function(msg) {
		await msg.react('⏬');
		await msg.react('🔽');
		await msg.react('🔼');
		await msg.react('⏫');
		const filter = (reaction, user) => {
			return ['⏬', '🔽', '🔼', '⏫'].includes(reaction.emojis[0].name) && !user.bot;
		};
		let page = 1;
		const collector = msg.createReactionCollector(filter, { time: 240000 });
		collector.on('collect', (reaction) => {
			// find what reaction was done
			const totalPage = Math.ceil(queue.length / 10);
			if (reaction.emojis[0].name === '⏬') {
				// last page
				page = totalPage;
				Page(page, msg, queue, fetched);
			} else if (reaction.emojis[0].name === '🔽') {
				// Show next 10 songs
				page = page + 1;
				if (page <= 1) page = 1;
				if (page >= totalPage) page = totalPage;
				Page(page, msg, queue, fetched);
			} else if (reaction.emojis[0].name === '🔼') {
				// show the last 10 previous songs
				page = page - 1;
				if (page <= 1) page = 1;
				if (page >= totalPage) page = totalPage;
				Page(page, msg, queue, fetched);
			} else {
				// This will show the first 10 songs (in queue)
				page = 1;
				Page(page, msg, queue, fetched);
			}
		});
	});
};
module.exports.config = {
	command: 'queue',
	aliases: ['que'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};
module.exports.help = {
	name: 'queue',
	category: 'Music',
	description: 'Displays the queue',
	usage: '${PREFIX}queue',
};
