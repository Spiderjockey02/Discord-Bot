// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Instagram extends Command {
	constructor(bot) {
		super(bot, {
			name: 'instagram',
			dirname: __dirname,
			aliases: ['insta'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on an Instagram account.',
			usage: 'instagram <user>',
			cooldown: 3000,
			examples: ['instagram discord'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		const username = message.args.join(' ');

		// Checks to see if a username was provided
		if (!username) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/instagram:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: `${this.help.name} account info` }));

		// Gather data from database
		const res = await fetch(`https://instagram.com/${username}/feed/?__a=1`)
			.then(info => info.json())
			.catch(err => {
			// An error occured when looking for account
				if (message.deletable) message.delete();
				msg.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			});

		// Delete wait message
		msg.delete();

		// make sure there is data
		if (res.size == 0) return;

		// Checks to see if a username in instagram database
		if (!res.graphql.user.username) return message.channel.error(settings.Language, 'SEARCHER/UNKNOWN_USER').then(m => m.delete({ timeout: 10000 }));

		// Displays Data
		const account = res.graphql.user;
		const embed = new MessageEmbed()
			.setColor(0x0099ff)
			.setTitle(account.full_name)
			.setURL(`https://instagram.com/${username}`)
			.setThumbnail(account.profile_pic_url)
			.addField('Username:', account.username)
			.addField('Full Name:', account.full_name)
			.addField('Biography:', (account.biography.length == 0) ? 'None' : account.biography)
			.addField('Posts:', account.edge_owner_to_timeline_media.count, true)
			.addField('Followers:', account.edge_followed_by.count, true)
			.addField('Following:', account.edge_follow.count, true)
			.addField('Private Account:', account.is_private ? 'Yes 🔒' : 'No 🔓', true)
			.addField('Verified account:', account.is_verified ? 'Yes ✅' : 'No ❌', true);
		message.channel.send(embed);
	}
};
