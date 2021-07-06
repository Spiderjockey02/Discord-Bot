// Dependencies
const { status } = require('minecraft-server-util'),
	{ MessageAttachment } = require('discord.js'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class MC extends Command {
	constructor(bot) {
		super(bot, {
			name: 'mc',
			dirname: __dirname,
			aliases: ['minecraft'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Pings a minecraft for information.',
			usage: 'mc <IP> [Port]',
			cooldown: 3000,
			examples: ['mc eu.hypixel.net'],
			slash: true,
			options: [{
				name: 'ip',
				description: 'IP of the Minecraft server.',
				type: 'STRING',
				required: true,
			},
			{
				name: 'port',
				description: 'Port of the Minecraft server.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Ping a minecraft server
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/mc:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('searcher/mc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// If no ping use 25565
		if (!message.args[1]) message.args[1] = '25565';

		// Ping server
		const resp = await this.createEmbed(bot, message.guild, message.channel, message.args[0], message.args[1]);
		msg.delete();
		if (Array.isArray(resp)) {
			await message.channel.send({ embeds: [resp[0]], files: [resp[1]] });
		} else {
			await message.channel.send({ embeds: [resp] });
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			IP = args.get('ip').value,
			port = args.get('port')?.value ?? 25565;

		try {
			const resp = await this.createEmbed(bot, guild, channel, IP, port);
			if (Array.isArray(resp)) {
				await bot.send(interaction, { embeds: [resp[0]], files: [resp[1]] });
			} else {
				await bot.send(interaction, { embeds: [resp] });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return bot.send(interaction, { embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	// create MC embed
	async createEmbed(bot, guild, channel, IP, port) {
		try {
			const response = await status(IP, { port: parseInt(port) });
			// turn favicon to thumbnail
			let attachment;
			if (response.favicon) {
				const imageStream = Buffer.from(response.favicon.split(',').slice(1).join(','), 'base64');
				attachment = new MessageAttachment(imageStream, 'favicon.png');
			}

			const embed = new Embed(bot, guild)
				.setColor(0x0099ff)
				.setTitle('searcher/mc:TITLE');
			if (response.favicon) embed.setThumbnail('attachment://favicon.png');
			embed.setURL(`https://mcsrvstat.us/server/${IP}:${port}`);
			embed.addField(guild.translate('searcher/mc:IP'), response.host);
			embed.addField(guild.translate('searcher/mc:VERSION'), response.version);
			embed.addField(guild.translate('searcher/mc:DESC'), response.description.descriptionText.replace(/§[a-zA-Z0-9]/g, ''));
			embed.addField(guild.translate('searcher/mc:PLAYERS'), `${response.onlinePlayers.toLocaleString(guild.settings.Language)}/${response.maxPlayers.toLocaleString(guild.settings.Language)}`);
			if (response.favicon) {
				return [embed, attachment];
			} else {
				return embed;
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
};
