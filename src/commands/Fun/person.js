// Dependencies
const axios = require('axios'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Person extends Command {
	constructor(bot) {
		super(bot, {
			name: 'person',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get someone random over internet.',
			usage: 'person',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		const url = 'https://person-generator.com/api/person';
		let response, data;
		try {
			response = await axios.get(url);
			data = response.data;
			const embed = new MessageEmbed()
				.setDescription(`**- Name :** ${data.name}
				**- Gender :** ${data.gender}
				**- Age :** ${data.age} Years
				**- DOB :** ${data.dob}
				**- Height :** ${data.height} inch
				**- Job :** ${data.profession}
				**- Company :** ${data.company}`)
				.setColor(3447003)
				.setThumbnail(bot.user.displayAvatarURL())
				.setFooter(`${message.translate(settings.Language, 'FUN/PERSON_FOOTER')}`, message.author.displayAvatarURL({
					dynamic: true,
				}))
				.setAuthor(`${message.translate(settings.Language, 'FUN/PERSON_AUTHOR')}${data.name}`)
				.setTimestamp();
			message.channel.send(embed);
		} catch (err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: person.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({
				timeout: 5000,
			}));
			if (message.deletable) message.delete();
		}
	}
};
