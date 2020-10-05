// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emoji, settings) => {
	// Delete message
	if (message.deletable) message.delete();
	// Check if a ticket channel is already open
	if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
		return message.channel.send({ embed:{ color:15158332, description:`${emoji} You already have a ticket channel` } }).then(m => m.delete({ timeout: 10000 }));
	}
	const reason = (args.join(' ').slice(8)) ? args.join(' ').slice(8) : 'No reason given';
	message.guild.channels.create(`ticket-${message.author.id}`, 'text').then(c => {
		// Support role ID
		const supportRole = message.guild.roles.cache.find(role => role.id == '750827122209325106');
		const everyoneRole = message.guild.roles.cache.find(role => role.name == '@everyone');
		// Category ID - Optional
		c.setParent('761289149008445461');
		c.updateOverwrite(message.author, {
			SEND_MESSAGES: true,
			READ_MESSAGES: true,
		});
		c.updateOverwrite(supportRole, {
			SEND_MESSAGES: true,
			READ_MESSAGES: true,
		});
		c.updateOverwrite(everyoneRole, {
			SEND_MESSAGES: false,
			READ_MESSAGES: false,
		});

		const ticketLog = new Discord.MessageEmbed()
			.setTitle('Ticket Opened!')
			.setTimestamp()
			.addField('Ticket', c)
			.addField('User', message.author)
			.addField('Reason', reason);
		const modChannel = message.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(ticketLog);

		const SuccessEmbed = new Discord.MessageEmbed()
			.setTitle('✅ Success!')
			.setDescription(`Your ticket has been created: ${c}`);
		message.channel.send(SuccessEmbed);

		const embed = new Discord.MessageEmbed()
			.setColor(0xFF5555)
			.addField(`Hey ${message.author.username}!`, 'Our support team will contact you as soon as possible.')
			.addField('Reason', reason)
			.setTimestamp();
		c.send({ embed: embed });
		c.send(`${message.author}`).then(c => c.delete({ timeout:1000 }));
	}).catch(console.error);
};

module.exports.config = {
	command: 'ticket',
	aliases: ['new-ticket'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
};

module.exports.help = {
	name: 'Ticket',
	category: 'moderation',
	description: 'Open a support ticket.',
	usage: '${PREFIX}ticket',
};
