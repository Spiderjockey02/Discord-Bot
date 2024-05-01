// Dependencies
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js'),
	{ promisify, inspect } = require('util'),
	readdir = promisify(require('fs').readdir), ;
import Command from '../../structures/Command';

/**
 * Script command
 * @extends {Command}
*/
export default class Script extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'script',
			ownerOnly: true,
			dirname: __dirname,
			aliases: ['scripts'],
			description: 'Runs a script file.',
			usage: 'script <file name> [...params]',
			cooldown: 3000,
			examples: ['script updateGuildSlashCommands client'],
			slash: false,
			options: [{
				name: 'track',
				description: 'The link or name of the track.',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(client, message) {
		const scripts = (await readdir('./src/scripts')).filter((v, i, a) => a.indexOf(v) === i);

		// No script was entered
		if (!message.args[0]) {
			const embed = new EmbedBuilder()
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
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			message.channel.error('Invalid script name.');
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(client, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
}

