// Dependencies
const { status } = require('minecraft-server-util'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class MC extends Command {
	constructor(bot) {
		super(bot, {
			name: 'mc',
			dirname: __dirname,
			aliases: ['minecraft'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Pings a minecraft for information.',
			usage: 'mc <IP> [Port]',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Ping a minecraft server
		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		const r = await message.channel.send('Pinging server..');

		// If no ping use 25565
		if(!args[1]) args[1] = '25565';

		// Ping server
		status(args[0], { port: parseInt(args[1]) }).then((response) => {
			const embed = new MessageEmbed()
				.setColor(0x0099ff)
				.setTitle('Server Status')
				.setURL(`https://mcsrvstat.us/server/${args[0]}:${args[1]}`)
				.addField('Server IP:', response.host)
				.addField('Server Version:', response.version)
				.addField('Description:', response.description.descriptionText)
				.addField('Online Players', `${response.onlinePlayers}/${response.maxPlayers}`);
			r.delete();
			message.channel.send(embed);
		}).catch(err => {
			// An error occured (either no IP, Open port or timed out)
			r.delete();
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		});
	}
};
