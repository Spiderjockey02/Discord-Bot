// Dependencies
const max = 100000,
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Random extends Command {
	constructor(bot) {
		super(bot, {
			name: 'random',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Replies with a random number.',
			usage: 'random <LowNum> <HighNum>',
			cooldown: 1000,
			examples: ['random 1 10', 'random 5 99'],
			slash: true,
			options: [{
				name: 'min',
				description: 'The minimum number for the range.',
				type: 'INTEGER',
				required: true,
			},
			{
				name: 'max',
				description: 'The maximum number for the range.',
				type: 'INTEGER',
				required: true,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {

		// Random number and facts command
		const num1 = parseInt(message.args[0]),
			num2 = parseInt(message.args[1]);

		// Make sure both entries are there
		if (!num1 || !message.args[1]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		} else {
			// Make sure both entries are numbers
			if (isNaN(num1) || isNaN(num2)) {
				if (message.deletable) message.delete();
				return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// Make sure they follow correct rules
			if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
				if (message.deletable) message.delete();
				return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/random:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			// send result
			const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setDescription(message.translate('fun/random:RESPONSE', { NUMBER: r }));
			message.channel.send({ embeds: [embed] });
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelID),
			settings = guild.settings,
			num1 = args.get('min').value,
			num2 = args.get('max').value;

		// Make sure they follow correct rules
		if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
			bot.send(interaction, { embeds: [channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(bot.translate('fun/random:USAGE')) }, true)], ephemeral: true });
		}
		// send result
		const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
		return await bot.send(interaction, { embeds: [{ color: 'RANDOM', description: guild.translate('fun/random:RESPONSE', { NUMBER: r }) }] });
	}
};
