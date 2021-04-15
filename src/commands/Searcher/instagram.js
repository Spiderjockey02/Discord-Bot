// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Fortnite extends Command {
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
		if (!username) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		const r = await message.channel.send('Gathering account details...');

		// Gather data from database
		const url = `https://instagram.com/${username}/?__a=1`;
		const res = await fetch(url).then(info => info.json()).catch(err => {
			// An error occured when looking for account
			if (message.deletable) message.delete();
			r.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		});

		// Delete wait message
		r.delete();

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
			.addField('Private Account:', account.is_private ? 'Yes :x:' : 'No :white_check_mark:', true)
			.addField('Verified account:', account.is_verified ? 'Yes' : 'No', true);
		message.channel.send(embed);
	}
};
