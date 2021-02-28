// paginator
function paginator(page, msg, queue, Currentposition, prefix) {
	if (page == 1) {
		// display queue
		let resp = '```ml\n';
		resp += '\t⬐ current track   \n';
		resp += `0) ${queue.current.title} ${new Date(queue.current.duration - Currentposition).toISOString().slice(14, 19)} left\n`;
		resp += '\t⬑ current track \n';
		for (let i = 0; i < 10; i++) {
			if (queue[i] != undefined) {
				resp += `${i + 1}) ${queue[i].title} ${new Date(queue[i].duration).toISOString().slice(14, 19)}\n`;
			}
		}
		if (queue.length < 10) {
			resp += `\n\tThis is the end of the queue!\n\tUse ${prefix}play to add more :^)\n`;
		}
		resp += '```';
		msg.edit(resp);
	} else {
		const songs = page * 10;
		let resp = '```ml\n',
			end = false;
		for (let i = (songs - 10); i < songs; i++) {
			// make song has been found
			if (queue[i] != undefined) {
				resp += `${i}) ${queue[i].title} ${new Date(queue[i].duration).toISOString().slice(14, 19)}\n`;
			} else if (!end) {
				// show end of queue message
				resp += `\n\tThis is the end of the queue!\n\tUse ${prefix}play to add more :^)\n`;
				end = true;
			}
		}
		resp += '```';
		msg.edit(resp);
	}
}

// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Queue extends Command {
	constructor(bot) {
		super(bot, {
			name: 'queue',
			dirname: __dirname,
			aliases: ['que'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Displays the queue.',
			usage: 'queue',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check if bot has permission to connect to voice channel
		if (!message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
			bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
		}

		// Check if bot has permission to delete emojis
		if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
			bot.logger.error(`Missing permission: \`MANAGE_MESSAGES\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_MESSAGES').then(m => m.delete({ timeout: 10000 }));
		}

		// get queue
		const queue = player.queue;
		if (queue.size == 0) {
			// eslint-disable-next-line quotes
			message.channel.send('```ml\n The queue is empty ;-;```');
			return;
		}
		// display queue
		let resp = '```ml\n';
		resp += '\t⬐ current track   \n';
		resp += `0) ${queue.current.title} ${new Date(queue.current.duration - player.position).toISOString().slice(14, 19)} left\n`;
		resp += '\t⬑ current track \n';
		for (let i = 0; i < 10; i++) {
			if (queue[i] != undefined) {
				resp += `${i + 1}) ${queue[i].title} ${new Date(queue[i].duration).toISOString().slice(14, 19)}\n`;
			}
		}
		if (queue.length < 10) {
			resp += `\n\tThis is the end of the queue!\n\tUse ${settings.prefix}play to add more :^)\n`;
		}
		resp += '```';

		// Displays message
		message.channel.send(resp).then(async (msg) => {
			// react to queue message
			await msg.react('⏬');
			await msg.react('🔽');
			await msg.react('🔼');
			await msg.react('⏫');

			// set up filter and page number
			const filter = (reaction, user) => {
				return ['⏬', '🔽', '🔼', '⏫'].includes(reaction.emoji.name) && !user.bot;
			};
			let page = 1;
			// create collector
			const collector = msg.createReactionCollector(filter, { time: queue.current.duration - player.position });
			collector.on('collect', (reaction) => {
				// find what reaction was done
				const totalPage = (queue.length >= 1) ? Math.round(queue.length / 10) : 1;
				if (reaction.emoji.name === '⏬') {
					// last page
					page = totalPage;
					paginator(page, msg, queue, player.position, settings.prefix);
				} else if (reaction.emoji.name === '🔽') {
					// Show next 10 songs
					page = page + 1;
					if (page <= 1) page = 1;
					if (page >= totalPage) page = totalPage;
					paginator(page, msg, queue, player.position, settings.prefix);
				} else if (reaction.emoji.name === '🔼') {
					// show the last 10 previous songs
					page = page - 1;
					if (page == 0) page = 1;
					if (page >= totalPage) page = totalPage;
					paginator(page, msg, queue, player.position, settings.prefix);
				} else {
					// This will show the first 10 songs (in queue)
					page = 1;
					paginator(page, msg, queue, player.position, settings.prefix);
				}
			});
		});
	}
};
