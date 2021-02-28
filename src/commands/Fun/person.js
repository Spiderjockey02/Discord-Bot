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
			description: 'Get information on a random person.',
			usage: 'person',
			cooldown: 1000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		let response, data;
		try {
			response = await axios.get('https://person-generator.com/api/person');
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
				.setFooter(`${message.translate(settings.Language, 'FUN/PERSON_FOOTER')}`, message.author.displayAvatarURL({ dynamic: true	}))
				.setAuthor(`${message.translate(settings.Language, 'FUN/PERSON_AUTHOR')}${data.name}`)
				.setTimestamp();
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
