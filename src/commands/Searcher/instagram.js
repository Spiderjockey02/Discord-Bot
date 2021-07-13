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
			slash: true,
			options: [{
				name: 'username',
				description: 'account name',
				type: 'STRING',
				required: true,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		const username = message.args.join(' ');

		// Checks to see if a username was provided
		if (!username) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/instagram:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Gather data from database
		const res = await this.createEmbed(bot, username, message.guild);
		msg.delete();
		if (typeof (res) == 'object') {
			message.channel.send({ embeds: [res] });
		} else {
			message.channel.send({ embeds: [message.channel.error(res)] });
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			username = args.get('username').value;

		const res = await this.createEmbed(bot, username, guild);
		if (typeof (res) == 'object') {
			interaction.reply({ embeds: [res] });
		} else {
			interaction.reply({ embeds: [channel.error(res, {}, true)] });
		}
	}
	// create Instagram embed
	async createEmbed(bot, username, guild) {
		const res = await fetch(`https://instagram.com/${username}/feed/?__a=1`)
			.then(info => info.json())
			.catch(err => {
			// An error occured when looking for account
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return guild.translate('misc:ERROR_MESSAGE', { ERROR: err.message });
			});

		// Checks to see if a username in instagram database
		if (res.size == 0 || !res.graphql?.user.username) return guild.translate('searcher/instagram:UNKNOWN_USER');

		// Displays Data
		const account = res.graphql.user;
		return new Embed(bot, guild)
			.setColor(0x0099ff)
			.setTitle(account.full_name)
			.setURL(`https://instagram.com/${username}`)
			.setThumbnail(account.profile_pic_url)
			.addField(guild.translate('searcher/instagram:USERNAME'), account.username)
			.addField(guild.translate('searcher/instagram:FULL_NAME'), account.full_name)
			.addField(guild.translate('searcher/instagram:BIOGRAPHY'), (account.biography.length == 0) ? 'None' : account.biography)
			.addField(guild.translate('searcher/instagram:POSTS'), account.edge_owner_to_timeline_media.count.toLocaleString(guild.settings.Language), true)
			.addField(guild.translate('searcher/instagram:FOLLOWERS'), account.edge_followed_by.count.toLocaleString(guild.settings.Language), true)
			.addField(guild.translate('searcher/instagram:FOLLOWING'), account.edge_follow.count.toLocaleString(guild.settings.Language), true)
			.addField(guild.translate('searcher/instagram:PRIVATE'), account.is_private ? 'Yes 🔒' : 'No 🔓', true)
			.addField(guild.translate('searcher/instagram:VERIFIED'), account.is_verified ? 'Yes ✅' : 'No ❌', true);
	}
};
