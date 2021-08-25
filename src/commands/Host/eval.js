// Dependencies
const { inspect } = require('util'),
	{ MessageEmbed } = require ('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Eval command
 * @extends {Command}
*/
class Eval extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'eval',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Evaluates JS code.',
			usage: 'eval <code>',
			cooldown: 3000,
			examples: ['eval bot.users.cache.get(\'184376969016639488\')'],
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Evaluated the code
		const toEval = message.args.join(' ');
		try {
			if (toEval) {
				// Auto-complete commands
				const hrStart = process.hrtime(),
					evaluated = await eval(toEval, { depth: 0 }),
					hrDiff = process.hrtime(hrStart);

				const embed = new MessageEmbed()
					.addField('Input:\n', '```js\n' + `${toEval.substring(0, 1010)}` + '```', false)
					.addField('Output:\n', '```js\n' + `${inspect(evaluated).substring(0, 1010)}` + '```', false)
					.addField('Time:\n', `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*`, true)
					.addField('Type:\n', typeof (evaluated), true);
				message.channel.send({ embeds: [embed] });
			} else {
				message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/eval:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Eval;
