import Puppeteer from 'puppeteer';
import { AttachmentBuilder, ApplicationCommandOptionType, PermissionFlagsBits, Message, CommandInteraction, Guild } from 'discord.js';
import validURL from 'valid-url';
import Command from 'src/structures/Command';
import EgglordClient from 'src/base/Egglord';
import { Setting } from '@prisma/client';

/**
 * Screenshot command
 * @extends {Command}
*/
export default class Screenshot extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'screenshot',
			dirname: __dirname,
			aliases: ['ss'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Get a screenshot of a website.',
			usage: 'screenshot <url>',
			cooldown: 5000,
			examples: ['screenshot https://www.google.com/'],
			slash: true,
			options: [{
				name: 'url',
				description: 'url of website to screenshot.',
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
  */
	async run(client: EgglordClient, message: Message, settings: Setting) {
		// make sure a website was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/screenshot:USAGE')) });
		}

		// make sure URl is valid
		if (!validURL.isUri(message.args[0])) {
			if (message.deletable) message.delete();
			return message.channel.error('fun/screenshot:INVALID_URL');
		}

		// Make sure website is not NSFW in a non-NSFW channel
		if (!client.adultSiteList.includes(require('url').parse(message.args[0]).host) && !message.channel.nsfw && message.guild) {
			if (message.deletable) message.delete();
			return message.channel.error('fun/screenshot:BLACKLIST_WEBSITE');
		}

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name }));

		// make screenshot
		const data = await this.fetchScreenshot(client, message.args[0]);
		if (!data) {
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' });
		} else {
			const attachment = new AttachmentBuilder(data, { name: 'website.png' });
			await message.channel.send({ files: [attachment] });
		}
		msg.delete();
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client: EgglordClient, interaction: CommandInteraction, guild: Guild, args: any) {
		const channel = guild.channels.cache.get(interaction.channelId),
			url = args.get('url').value;

		// make sure URl is valid
		if (!validURL.isUri(url)) return interaction.reply({ embeds: [channel.error('fun/screenshot:INVALID_URL', {}, true)], ephermal: true });

		// Make sure website is not NSFW in a non-NSFW channel
		if (!client.adultSiteList.includes(require('url').parse(url).host) && !channel.nsfw) return interaction.reply({ embeds: [channel.error('fun/screenshot:BLACKLIST_WEBSITE', {}, true)], ephermal: true });

		// display phrases' definition
		await interaction.deferReply();
		const data = await this.fetchScreenshot(client, url);
		if (!data) {
			interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }, true)], ephemeral: true });
		} else {
			const attachment = new AttachmentBuilder(data, { name: 'website.png' });
			interaction.editReply({ files: [attachment] });
		}
	}

	async reply(client, interaction, channel, message) {
		const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
		if (!message.content.match(urlRegex)) return interaction.reply({ embeds: [channel.error('That is not a website', {}, true)], ephermal: true });
		const url = message.content.match(urlRegex)[0];

		// make sure URl is valid
		if (!validURL.isUri(url)) {
			return interaction.reply({ embeds: [channel.error('fun/screenshot:INVALID_URL', {}, true)], ephermal: true });
		}

		// Make sure website is not NSFW in a non-NSFW channel
		if (!client.adultSiteList.includes(require('url').parse(url).host) && !channel.nsfw) return interaction.reply({ embeds: [channel.error('fun/screenshot:BLACKLIST_WEBSITE', {}, true)], ephermal: true });

		// display phrases' definition
		await interaction.deferReply();
		const data = await this.fetchScreenshot(client, url);
		if (!data) {
			interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }, true)] });
		} else {
			const attachment = new AttachmentBuilder(data, { name: 'website.png' });
			interaction.editReply({ files: [attachment] });
		}
	}

	/**
	 * Function for creating the screenshot of the URL.
	 * @param {client} client The instantiating client
	 * @param {string} URL The URL to screenshot from
	 * @returns {embed}
	*/
	async fetchScreenshot(client: EgglordClient, URL: string) {
		// try and create screenshot
		let data;
		try {
			const browser = await Puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
			const page = await browser.newPage();
			await page.setViewport({ width: 1280, height: 720 });
			await page.goto(URL);
			await client.delay(1500);
			data = await page.screenshot();
			await browser.close();
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		}
		return data;
	}
}

