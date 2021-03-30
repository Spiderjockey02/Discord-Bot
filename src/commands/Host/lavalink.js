// Dependencies
const	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Lavalink extends Command {
	constructor(bot) {
		super(bot, {
			name: 'lavalink',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays Lavalink node information',
			usage: 'lavalink',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message) {
		const msg = await message.channel.send('Getting lavalink stats...');

		const {	memory,	cpu,	uptime,	playingPlayers,	players } = bot.manager.nodes.first().stats;

		const allocated = Math.floor(memory.allocated / 1024 / 1024);
		const used = Math.floor(memory.used / 1024 / 1024);
		const free = Math.floor(memory.free / 1024 / 1024);
		const reservable = Math.floor(memory.reservable / 1024 / 1024);

		const systemLoad = (cpu.systemLoad * 100).toFixed(2);
		const lavalinkLoad = (cpu.lavalinkLoad * 100).toFixed(2);

		const botUptime = this.uptime(uptime);

		const embed = new MessageEmbed()
			.setAuthor('Lavalink Statistics')
			.addField('Playing Players/Players', `\`\`\`${playingPlayers} playing / ${players} players\`\`\``)
			.addField('Memory', `\`\`\`Allocated: ${allocated} MB\nUsed: ${used} MB\nFree: ${free} MB\nReservable: ${reservable} MB\`\`\``)
			.addField('CPU', `\`\`\`Cores: ${cpu.cores}\nSystem Load: ${systemLoad}%\nLavalink Load: ${lavalinkLoad}%\`\`\``)
			.addField('Uptime', `\`\`\`${botUptime}\`\`\``)
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
