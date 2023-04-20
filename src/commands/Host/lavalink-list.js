// Dependencies
const	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');
/**
 * Lavalink command
 * @extends {Command}
*/
class LavalinkList extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'lavalink-list',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		// show list of available nodes
		const embed = new Embed(bot, guild)
			.setTitle('Lavalink nodes:')
			.setDescription(bot.manager.nodes.map((node, index, array) => {
				return `${array.map(({ options }) => options.host).indexOf(index) + 1}.) **${node.options.host}** (Uptime: ${node.stats.uptime ? this.uptime(node.stats.uptime) : 'Not connected'})`;
			}).join('\n'));
		return interaction.reply({ embeds: [embed] });
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

module.exports = LavalinkList;
