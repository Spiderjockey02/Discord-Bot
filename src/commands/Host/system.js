// Dependencies
const { MessageEmbed, version } = require('discord.js'),
	osu = require('node-os-utils'),
	os = require('os'),
	Command = require('../../structures/Command.js');

module.exports = class Status extends Command {
	constructor(bot) {
		super(bot, {
			name: 'system',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays the bots statistics',
			usage: 'status',
			cooldown: 3000,
		});
	}
	// Run command
	async run(bot, message) {

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }), { tts: true });

		const config = { fullBar: '█', emptyBar: '░', barPrecision: 20 };

		let cpuUsage, processes, driveUsed, driveFree, networkUsage, networkUsageIn, networkUsageOut;

		const calculations = { freeRAM: os.freemem(), usedRAM: os.totalmem() - os.freemem() };

		const barGeneration = (used, free) => {
			const total = used + free;
			used = Math.round((used / total) * config.barPrecision);
			free = Math.round((free / total) * config.barPrecision);
			return config.fullBar.repeat(used) + config.emptyBar.repeat(free);
		};

		const p1 = osu.cpu.usage().then(cpuPercentage => {
			cpuUsage = cpuPercentage;
		});

		const p2 = osu.proc.totalProcesses().then(process => {
			processes = process;
		});

		const p3 = osu.drive.info()
			.then(i => {
				driveUsed = i.usedPercentage;
				driveFree = i.freePercentage;
			})
			.catch(() => {
				driveUsed = false;
			});

		const p4 = osu.netstat
			.inOut()
			.then(i => {
				networkUsage = i.total;
				networkUsageIn = networkUsage.inputMb;
				networkUsageOut = networkUsage.outputMb;
			})
			.catch(() => {
				networkUsage = false;
			});

		await Promise.all([p1, p2, p3, p4]);

		const embed = new Embed(bot, message.guild)
			.setColor('#a918ec')
			.addField('Main Package Version:', `Discord.js Version: Discord.js: ${version}v\nNode.js Version: ${process.version.slice(1).split('.')[0]}v`)
			.addField('Used:', [
				`RAM: ${barGeneration(calculations.usedRAM, calculations.freeRAM)} [${Math.round((100 * calculations.usedRAM) / (calculations.usedRAM + calculations.freeRAM))}%]`,
				`CPU: ${barGeneration(cpuUsage, 100 - cpuUsage)} [${Math.round(cpuUsage)}%]`,
				`MEMORY USED: ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)}MB`,
				`${driveUsed ? `STORAGE ${barGeneration(driveUsed, driveFree)} [${Math.round(driveUsed)}%]` : ''}`,
				`${processes != 'not supported' ? `PROCESSES: ${processes}` : ''}`,
			].join('\n'))
			.addField('Machine Specs:', [
				`CPU Count: ${osu.cpu.count()}`,
				`CPU Model: ${os.cpus()[0].model}`,
				`CPU Speed: ${os.cpus()[0].speed}MHz`,
				`${osu.os.platform() != 'win32' ? `Storage: ${barGeneration(driveUsed, driveFree)} [${driveUsed}%]` : ''}`,
			].join('\n'))
			.addField('System Specs:', [
				`System Type: ${osu.os.type()}`,
				`System Architecture: ${osu.os.arch()}`,
				`System Platform: ${osu.os.platform()}`,
			].join('\n'));
		if (networkUsage) {
			embed.addField('Network Stats:', [
				`Input Speed: ${networkUsageIn}`,
				`Output Speed: ${networkUsageOut}`,
			].join('\n'));
		}
		embed.addField('Bot Stats:', `Uptime: ${bot.timeFormatter.getReadableTime(bot.uptime)}.`);
		embed.setTimestamp();
		msg.delete();
		message.channel.send(embed);
	}
};
