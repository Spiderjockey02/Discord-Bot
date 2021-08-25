// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

/**
 * Instagram command
 * @extends {Command}
*/
class Instagram extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
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

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		const username = message.args.join(' ');

		// Checks to see if a username was provided
		if (!username) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/instagram:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/fortnite:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Gather data from database
		const res = await this.createEmbed(bot, username, message.guild);
		msg.delete();
		if (typeof (res) == 'object') {
			message.channel.send({ embeds: [res] });
		} else {
			message.channel.send({ embeds: [message.channel.error(res)] });
		}
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
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

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {bot} bot The instantiating client
	 * @param {string} username The username to search
	 * @param {guild} guild The guild the command was ran in
	 * @returns {embed}
	*/
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
}

module.exports = Instagram;
