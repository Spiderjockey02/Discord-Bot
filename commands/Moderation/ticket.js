// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Check if bot can create channel
	if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`MANAGE_CHANNELS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
		return;
	}
	// Check if a ticket channel is already open
	if (message.guild.channels.cache.find(channel => channel.name == `ticket-${message.author.id}`)) {
		return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You already have a ticket channel` } }).then(m => m.delete({ timeout: 10000 }));
	}
	const reason = (args.join(' ').slice(8)) ? args.join(' ').slice(8) : 'No reason given';
	message.guild.channels.create(`ticket-${message.author.id}`, 'text').then(channel => {
		// Support role ID
		const supportRole = message.guild.roles.cache.find(role => role.id == settings.TicketSupportRole);
		console.log(supportRole);
		if (!supportRole) {
			return message.channel.send(`${emojis[0]} No support role has been created on this server yet.`).then(m => m.delete({ timeout: 10000 }));
		}
		const everyoneRole = message.guild.roles.cache.find(role => role.name == '@everyone');
		// Category ID - Optional
		channel.setParent(settings.TicketCategory);
		// update permissions so only user and support role can see this
		channel.updateOverwrite(message.author, {
			SEND_MESSAGES: true,
			READ_MESSAGES: true,
		});
		channel.updateOverwrite(supportRole, {
			SEND_MESSAGES: true,
			READ_MESSAGES: true,
		});
		channel.updateOverwrite(everyoneRole, {
			SEND_MESSAGES: false,
			READ_MESSAGES: false,
		});
		// send ticket log (goes in ModLOg channel)
		const ticketLog = new Discord.MessageEmbed()
			.setTitle('Ticket Opened!')
			.addField('Ticket', channel)
			.addField('User', message.author)
			.addField('Reason', reason)
			.setTimestamp();
		const modChannel = message.guild.channels.cache.find(c => c.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(ticketLog);

		// reply to user saying that channel has been created
		const successEmbed = new Discord.MessageEmbed()
			.setTitle('✅ Success!')
			.setDescription(`Your ticket has been created: ${channel}`);
		message.channel.send(successEmbed).then(m => m.delete({ timeout:10000 }));

		// Add message to ticket channel
		const embed = new Discord.MessageEmbed()
			.setColor(0xFF5555)
			.addField(`Hey ${message.author.username}!`, 'Our support team will contact you as soon as possible.')
			.addField('Reason', reason)
			.setTimestamp();
		channel.send(embed);
		channel.send(`${message.author}`).then(m => m.delete({ timeout:1000 }));
	}).catch(console.error);
};

module.exports.config = {
	command: 'ticket',
	aliases: ['new-ticket'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
};

module.exports.help = {
	name: 'Ticket',
	category: 'Moderation',
	description: 'Open a support ticket.',
	usage: '${PREFIX}ticket [reason]',
	example: '${PREFIX}ticket I have found a bug.',
};
