// Dependencies
const	{ Embed } = require('../../utils'),
	{ Node } = require('erela.js'),
	{ ApplicationCommandOptionType } = require('discord.js'),
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
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: true,
			options: [{
				name: 'option',
				description: 'The link or name of the track.',
				type: ApplicationCommandOptionType.String,
				choices: [...['list', 'add', 'remove'].map(i => ({ name: i, value: i }))],
				required: true,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message, settings) {
		let msg, memory,	cpu,	uptime,	playingPlayers,	players;

		switch (message.args[0]) {
			case 'list': {
				// show list of available nodes
				const embed = new Embed(bot, message.guild)
					.setTitle('Lavalink nodes:')
					.setDescription(bot.manager.nodes.map((node, index, array) => {
						return `${array.map(({ options }) => options.host).indexOf(index) + 1}.) **${node.options.host}** (Uptime: ${this.uptime(node.stats.uptime ?? 0)})`;
					}).join('\n'));
				return message.channel.send({ embeds: [embed] });
			}
			case 'add':
				try {
					// Connect to new node
					await (new Node({
						host: message.args[1] ?? 'localhost',
						password: message.args[2] ?? 'youshallnotpass',
						port: parseInt(message.args[3]) ?? 5000,
					})).connect();
					message.channel.success('host/node:ADDED_NODE');
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
				break;
			case 'remove':
				try {
					await (new Node({
						host: message.args[1] ?? 'localhost',
						password: message.args[2] ?? 'youshallnotpass',
						port: parseInt(message.args[3]) ?? 5000,
					})).destroy();
					message.channel.success('host/node:REMOVED_NODE');
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
				break;
			default:
				if (bot.manager.nodes.get(message.args[0])) {
					msg = await message.channel.send(message.translate('host/lavalink:FETCHING')),
					{	memory,	cpu,	uptime,	playingPlayers,	players } = bot.manager.nodes.get(message.args[0]).stats;

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
						.addFields(
							{ name: message.translate('host/lavalink:PLAYERS'), value: message.translate('host/lavalink:PLAYER_STATS', { PLAYING: playingPlayers, PLAYERS: players }) },
							{ name: message.translate('host/lavalink:MEMORY'), value: message.translate('host/lavalink:MEMORY_STATS', { ALL: allocated, USED: used, FREE: free, RESERVE: reservable }) },
							{ name: message.translate('host/lavalink:CPU'), value: message.translate('host/lavalink:CPU_STATS', { CORES: cpu.cores, SYSLOAD: systemLoad, LVLLOAD: lavalinkLoad }) },
							{ name: message.translate('host/lavalink:UPTIME'), value: message.translate('host/lavalink:UPTIME_STATS', { NUM: botUptime }) },
						)
						.setTimestamp(Date.now());
					return msg.edit({ content: ' ', embeds: [embed] });
				} else {
					return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/lavalink:USAGE')) });
				}
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
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
