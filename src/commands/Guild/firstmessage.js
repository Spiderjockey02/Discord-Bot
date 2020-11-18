// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message) => {
	try {
		const messages = await message.channel.messages.fetch({ after: 1, limit: 1 });
		const fMessage = messages.first();
		const embed = new MessageEmbed()
			.setColor(fMessage.member ? fMessage.member.displayHexColor : 0x00AE86)
			.setThumbnail(fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setAuthor(fMessage.author.tag, fMessage.author.displayAvatarURL({ format: 'png', dynamic: true }))
			.setDescription(fMessage.content)
			.setTimestamp(fMessage.createdAt)
			.setFooter(`ID: ${fMessage.id}`)
			.addField('❯ Jump', fMessage.url);
		message.channel.send(embed);
	} catch (e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'firstmessage',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'firstmessage',
	category: 'Guild',
	description: 'Get the first fMessage.',
	usage: '${PREFIX}firstmessage',
};
