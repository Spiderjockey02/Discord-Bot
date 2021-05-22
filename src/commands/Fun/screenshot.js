// Dependencies
const Puppeteer = require('puppeteer'),
	{ MessageAttachment } = require('discord.js'),
	validUrl = require('valid-url'),
	Command = require('../../structures/Command.js');

module.exports = class Screenshot extends Command {
	constructor(bot) {
		super(bot, {
			name: 'screenshot',
			dirname: __dirname,
			aliases: ['ss'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
			description: 'Get a screenshot of a website.',
			usage: 'screenshot <url>',
			cooldown: 5000,
			examples: ['screenshot https://www.google.com/'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// make sure a website was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('fun/screenshot:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// make sure URl is valid
		if (!validUrl.isUri(message.args[0])) {
			if (message.deletable) message.delete();
			return message.channel.error('fun/screenshot:INVALID_URL').then(m => m.delete({ timeout: 5000 }));
		}

		// Make sure website is not NSFW in a non-NSFW channel
		if (!bot.adultSiteList.includes(require('url').parse(message.args[0]).host) && !message.channel.nsfw) {
			if (message.deletable) message.delete();
			return message.channel.error('fun/screenshot:BLACKLIST_WEBSITE').then(m => m.delete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// try and create screenshot
		let data;
		try {
			const browser = await Puppeteer.launch();
			const page = await browser.newPage();
			await page.setViewport({
				width: 1280,
				height: 720,
			});
			await page.goto(message.args[0]);
			await bot.delay(1500);
			data = await page.screenshot();
			await browser.close();
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		}

		// make screenshot
		if (!data) {
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: 'Failed to fetch screenshot' }).then(m => m.delete({ timeout: 5000 }));
		} else {
			const attachment = new MessageAttachment(data, 'website.png');
			await message.channel.send(attachment);
		}
		msg.delete();
	}
};
