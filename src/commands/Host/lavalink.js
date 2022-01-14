// Dependencies
const	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Lavalink command
 * @extends {Command}
*/
class Lavalink extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'lavalink',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays Lavalink node information',
			usage: 'lavalink [host / list]',
			cooldown: 3000,
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		let msg, memory,	cpu,	uptime,	playingPlayers,	players;
		if (message.args[0] == 'list') {
			// show list of available nodes
			const embed = new Embed(bot, message.guild)
				.setTitle('Lavalink nodes:')
				.setDescription(bot.manager.nodes.map((node, index, array) => {
					return `${array.map(({ options }) => options.host).indexOf(index) + 1}.) **${node.options.host}** (Uptime: ${this.uptime(node.stats.uptime ?? 0)})`;
				}).join('\n'));
			return message.channel.send({ embeds: [embed] });
		} else if (bot.manager.nodes.get(message.args[0])) {
			msg = await message.channel.send(message.translate('host/lavalink:FETCHING')),
			{	memory,	cpu,	uptime,	playingPlayers,	players } = bot.manager.nodes.get(message.args[0]).stats;
		} else {
			msg = await message.channel.send(message.translate('host/lavalink:FETCHING')),
			{	memory,	cpu,	uptime,	playingPlayers,	players } = bot.manager.nodes.first().stats;
		}

		// RAM usage
		const allocated = Math.floor(memory.allocated / 1024 / 1024),
			used = Math.floor(memory.used / 1024 / 1024),
			free = Math.floor(memory.free / 1024 / 1024),
			reservable = Math.floor(memory.reservable / 1024 / 1024);

		// CPU usage
		const systemLoad = (cpu.systemLoad * 100).toFixed(2),
			lavalinkLoad = (cpu.lavalinkLoad * 100).toFixed(2);

		// Lavalink uptime
		const botUptime = this.uptime(uptime);

		const embed = new Embed(bot, message.guild)
			.setAuthor({ name: message.translate('host/lavalink:AUTHOR', { NAME: bot.manager.nodes.get(message.args[0])?.options.host ?? bot.manager.nodes.first().options.host }) })
			.addField(message.translate('host/lavalink:PLAYERS'), message.translate('host/lavalink:PLAYER_STATS', { PLAYING: playingPlayers, PLAYERS: players }))
			.addField(message.translate('host/lavalink:MEMORY'), message.translate('host/lavalink:MEMORY_STATS', { ALL: allocated, USED: used, FREE: free, RESERVE: reservable }))
			.addField(message.translate('host/lavalink:CPU'), message.translate('host/lavalink:CPU_STATS', { CORES: cpu.cores, SYSLOAD: systemLoad, LVLLOAD: lavalinkLoad }))
			.addField(message.translate('host/lavalink:UPTIME'), message.translate('host/lavalink:UPTIME_STATS', { NUM: botUptime }))
			.setTimestamp(Date.now());
		return msg.edit({ content: ' ', embeds: [embed] });
	}

	/**
	 * Function for turning number to timestamp.
	 * @param {time} number The uptime of the lavalink server
 	 * @returns {String}
	*/
	uptime(time) {
		const calculations = {
			week: Math.floor(time / (1000 * 60 * 60 * 24 * 7)),
			day: Math.floor(time / (1000 * 60 * 60 * 24)),
			hour: Math.floor((time / (1000 * 60 * 60)) % 24),
			minute: Math.floor((time / (1000 * 60)) % 60),
			second: Math.floor((time / 1000) % 60),
		};
		if (calculations.week >= 1) calculations.days -= calculations.week * 7;

		let str = '';
		for (const [key, val] of Object.entries(calculations)) {
			if (val > 0) str += `${val} ${key}${val > 1 ? 's' : ''} `;
		}

		return str;
	}
}

module.exports = Lavalink;
