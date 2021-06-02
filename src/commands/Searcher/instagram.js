// Dependencies
const { Embed } = require('../../utils'),
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
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

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

		// Checks to see if a username in instagram database
		if (res.size == 0 || !res.graphql.user.username) return message.channel.error('searcher/instagram:UNKNOWN_USER').then(m => m.delete({ timeout: 10000 }));

		// Displays Data
		const account = res.graphql.user;
		const embed = new Embed(bot, message.guild)
			.setColor(0x0099ff)
			.setTitle(account.full_name)
			.setURL(`https://instagram.com/${username}`)
			.setThumbnail(account.profile_pic_url)
			.addField(message.translate('searcher/instagram:USERNAME'), account.username)
			.addField(message.translate('searcher/instagram:FULL_NAME'), account.full_name)
			.addField(message.translate('searcher/instagram:BIOGRAPHY'), (account.biography.length == 0) ? 'None' : account.biography)
			.addField(message.translate('searcher/instagram:POSTS'), account.edge_owner_to_timeline_media.count.toLocaleString(settings.Language), true)
			.addField(message.translate('searcher/instagram:FOLLOWERS'), account.edge_followed_by.count.toLocaleString(settings.Language), true)
			.addField(message.translate('searcher/instagram:FOLLOWING'), account.edge_follow.count.toLocaleString(settings.Language), true)
			.addField(message.translate('searcher/instagram:PRIVATE'), account.is_private ? 'Yes 🔒' : 'No 🔓', true)
			.addField(message.translate('searcher/instagram:VERIFIED'), account.is_verified ? 'Yes ✅' : 'No ❌', true);
		message.channel.send(embed);
	}
};
