// Dependencies
const	{ Embed } = require('../../utils'),
	{ Node } = require('magmastream'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Lavalink command
 * @extends {Command}
*/
export default class Lavalink extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'lavalink',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: true,
			options: client.subCommands.filter(c => c.help.name.startsWith('lavalink-')).map(c => ({
				name: c.help.name.replace('lavalink-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(client, message, settings) {
		let msg, memory,	cpu,	uptime,	playingPlayers,	players;

		switch (message.args[0]) {
			case 'list': {
				// show list of available nodes
				const embed = new Embed(client, message.guild)
					.setTitle('Lavalink nodes:')
					.setDescription(client.manager.nodes.map((node, index, array) => {
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
					client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
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
					client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
				}
				break;
			default:
				if (client.manager.nodes.get(message.args[0])) {
					msg = await message.channel.send(message.translate('host/lavalink:FETCHING')),
					{	memory,	cpu,	uptime,	playingPlayers,	players } = client.manager.nodes.get(message.args[0]).stats;

					// RAM usage
					const allocated = Math.floor(memory.allocated / 1024 / 1024),
						used = Math.floor(memory.used / 1024 / 1024),
						free = Math.floor(memory.free / 1024 / 1024),
						reservable = Math.floor(memory.reservable / 1024 / 1024);

					// CPU usage
					const systemLoad = (cpu.systemLoad * 100).toFixed(2),
						lavalinkLoad = (cpu.lavalinkLoad * 100).toFixed(2);

					// Lavalink uptime
					const clientUptime = this.uptime(uptime);

					const embed = new Embed(client, message.guild)
						.setAuthor({ name: message.translate('host/lavalink:AUTHOR', { NAME: client.manager.nodes.get(message.args[0])?.options.host ?? client.manager.nodes.first().options.host }) })
						.addFields(
							{ name: message.translate('host/lavalink:PLAYERS'), value: message.translate('host/lavalink:PLAYER_STATS', { PLAYING: playingPlayers, PLAYERS: players }) },
							{ name: message.translate('host/lavalink:MEMORY'), value: message.translate('host/lavalink:MEMORY_STATS', { ALL: allocated, USED: used, FREE: free, RESERVE: reservable }) },
							{ name: message.translate('host/lavalink:CPU'), value: message.translate('host/lavalink:CPU_STATS', { CORES: cpu.cores, SYSLOAD: systemLoad, LVLLOAD: lavalinkLoad }) },
							{ name: message.translate('host/lavalink:UPTIME'), value: message.translate('host/lavalink:UPTIME_STATS', { NUM: clientUptime }) },
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
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const command = client.subCommands.get(`lavalink-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(client, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
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
