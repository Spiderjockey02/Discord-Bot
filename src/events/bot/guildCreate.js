// Dependencies
const { MessageEmbed, MessageAttachment } = require('discord.js'),
	{ Canvas } = require('canvacord'),
	Event = require('../../structures/Event');

/**
 * Guild create event
 * @event Egglord#GuildCreate
 * @extends {Event}
*/
class GuildCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Guild} guild The guild that added the bot
	 * @readonly
	*/
	async run(bot, guild) {
		// LOG server Join
		bot.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot.`);

		// Apply server settings
		try {
			// Create guild settings and fetch cache.
			await guild.fetchSettings();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Send message to channel that bot has joined a server
		const owner = await guild.members.fetch(guild.ownerId);
		const embed = new MessageEmbed()
			.setTitle(`[GUILD JOIN] ${guild.name}`);
		let attachment;
		if (guild.icon == null) {
			const icon = await Canvas.guildIcon(guild.name, 128);
			attachment = new MessageAttachment(icon, 'guildicon.png');
			embed.setImage('attachment://guildicon.png');
		} else {
			embed.setImage(guild.iconURL({ dynamic: true, size: 1024 }));
		}
		embed.setDescription([
			`Guild ID: ${guild.id ?? 'undefined'}`,
			`Owner: ${owner.user.tag}`,
			`MemberCount: ${guild.memberCount ?? 'undefined'}`,
		].join('\n'));

		// Fetch all members in guild
		try {
			await guild.members.fetch();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Find channel and send message
		const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
		if (modChannel) bot.addEmbed(modChannel.id, [embed, attachment]);

		// update bot's activity
		bot.SetActivity('WATCHING', [`${bot.guilds.cache.size} servers!`, `${bot.users.cache.size} users!`]);

		// get slash commands for category
		const enabledPlugins = guild.settings.plugins;
		const data = [];
		for (const plugin of enabledPlugins) {
			const g = await bot.loadInteractionGroup(plugin, guild);
			if (Array.isArray(g)) data.push(...g);
		}

		// upload slash commands to guild
		try {
			await bot.guilds.cache.get(guild.id)?.commands.set(data);
			bot.logger.log('Loaded Interactions for guild: ' + guild.name);
		} catch (err) {
			bot.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
		}
	}
}

module.exports = GuildCreate;
