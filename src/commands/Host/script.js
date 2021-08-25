// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ promisify, inspect } = require('util'),
	readdir = promisify(require('fs').readdir),
	Command = require('../../structures/Command.js');

/**
 * Script command
 * @extends {Command}
*/
class Script extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'script',
			ownerOnly: true,
			dirname: __dirname,
			aliases: ['scripts'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Runs a script file.',
			usage: 'script <file name> [...params]',
			cooldown: 3000,
			examples: ['script updateGuildSlashCommands bot'],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		const scripts = (await readdir('./src/scripts')).filter((v, i, a) => a.indexOf(v) === i);

		// No script was entered
		if (!message.args[0]) {
			const embed = new MessageEmbed()
				.setTitle('Available scripts:')
				.setDescription(scripts.map((c, i) => `${i + 1}.) ${c.replace('.js', '')}`).join('\n'));
			return message.channel.send({ embeds: [embed] });
		}

		// script found
		if (scripts.includes(`${message.args[0]}.js`)) {
			try {
				const resp = await require(`../../scripts/${message.args[0]}.js`).run(eval(message.args[1], { depth: 0 }), eval(message.args[2], { depth: 0 }), eval(message.args[3], { depth: 0 }));
				message.channel.send('```js\n' + `${inspect(resp).substring(0, 1990)}` + '```');
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			message.channel.error('Invalid script name.');
		}
	}
}

module.exports = Script;
