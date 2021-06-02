// Dependencies
const	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Lavalink extends Command {
	constructor(bot) {
		super(bot, {
			name: 'lavalink',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays Lavalink node information',
			usage: 'lavalink [host]',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message) {
		let msg, memory,	cpu,	uptime,	playingPlayers,	players;
		if (message.args[0]) {
			if (!bot.manager.nodes.get(message.args[0])) return message.error('host/lavalink:INVALID_HOST');
			msg = await message.channel.send('Getting lavalink stats...'),
			{	memory,	cpu,	uptime,	playingPlayers,	players } = bot.manager.nodes.get(message.args[0]).stats;
		} else {
			msg = await message.channel.send('Getting lavalink stats...'),
			{	memory,	cpu,	uptime,	playingPlayers,	players } = bot.manager.nodes.first().stats;
		}


		const allocated = Math.floor(memory.allocated / 1024 / 1024),
			used = Math.floor(memory.used / 1024 / 1024),
			free = Math.floor(memory.free / 1024 / 1024),
			reservable = Math.floor(memory.reservable / 1024 / 1024);

		const systemLoad = (cpu.systemLoad * 100).toFixed(2),
			lavalinkLoad = (cpu.lavalinkLoad * 100).toFixed(2);

		const botUptime = this.uptime(uptime);

		const embed = new Embed(bot, message.guild)
			.setAuthor(message.translate('host/lavalink:AUTHOR', { NAME: bot.manager.nodes.get(message.args[0])?.options.host ?? bot.manager.nodes.first().options.host }))
			.addField(message.translate('host/lavalink:PLAYERS'), message.translate('host/lavalink:PLAYER_STATS', { PLAYING: playingPlayers, PLAYERS: players }))
			.addField(message.translate('host/lavalink:MEMORY'), message.translate('host/lavalink:MEMORY_STATS', { ALL: allocated, USED: used, FREE: free, RESERVE: reservable }))
			.addField(message.translate('host/lavalink:CPU'), message.translate('host/lavalink:CPU_STATS', { CORES: cpu.cores, SYSLOAD: systemLoad, LVLLOAD: lavalinkLoad }))
			.addField(message.translate('host/lavalink:UPTIME'), message.translate('host/lavalink:UPTIME_STATS', { NUM: botUptime }))
			.setTimestamp(Date.now());
		return msg.edit('', embed);
	}

	uptime(time) {
		const calculations = {
			week: Math.floor(time / (1000 * 60 * 60 * 24 * 7)),
			day: Math.floor(time / (1000 * 60 * 60 * 24)),
			hour: Math.floor((time / (1000 * 60 * 60)) % 24),
			minute: Math.floor((time / (1000 * 60)) % 60),
			second: Math.floor((time / 1000) % 60),
		};

		let str = '';
		for (const [key, val] of Object.entries(calculations)) {
			if (val > 0) str += `${val} ${key}${val > 1 ? 's' : ''} `;
		}

		return str;
	}
};
