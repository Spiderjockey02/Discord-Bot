// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Pokemon extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pokemon',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on a pokemon.',
			usage: 'pokemon <pokemon>',
			cooldown: 1000,
			examples: ['pokemon charizard', 'pokemon pikachu'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get pokemon
		const pokemon = message.args.join(' ');
		if (!pokemon) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name}...`);

		// Search for pokemon
		const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${message.args.join(' ')}`)
			.then((info) => info.json())
			.catch((err) => {
				// An error occured when looking for account
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			});

		// Send response to channel
		const embed = new MessageEmbed()
			.setAuthor(res.name, `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.typeIcon}`)
			.setDescription(`Type of this pokemon is **${res.info.type}**. ${res.info.description}`)
			.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.photo}`)
			.setFooter(`Weakness of pokemon - ${res.info.weakness}`, `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.weaknessIcon}`);
		message.channel.send(embed);
		msg.delete();
	}
};
