// Dependencies
const Puppeteer = require('puppeteer'),
	{ MessageAttachment } = require('discord.js'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
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
		// Make sure bot has permissions to send attachments
		if (!message.channel.permissionsFor(bot.user).has('ATTACH_FILES')) {
			bot.logger.error(`Missing permission: \`ATTACH_FILES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ATTACH_FILES').then(m => m.delete({ timeout: 10000 }));
		}

		// make sure a website was entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// make sure URl is valid
		if (!validUrl.isUri(message.args[0])) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'FUN/INVALID_URL').then(m => m.delete({ timeout: 5000 }));
		}

		// Make sure website is not NSFW in a non-NSFW channel
		if (!bot.adultSiteList.includes(require('url').parse(message.args[0]).host) && !message.channel.nsfw) {
			return message.channel.error(settings.Language, 'FUN/BLACKLIST_WEBSITE').then(m => m.delete({ timeout: 5000 }));
		}

		// send 'waiting' message
		const msg = await message.channel.send('Creating screenshot of website.');

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
			await delay(1500);
			data = await page.screenshot();
			await browser.close();
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		}

		// make screenshot
		if (!data) {
			message.channel.error(settings.Language, 'ERROR_MESSAGE', 'Failed to fetch screenshot').then(m => m.delete({ timeout: 5000 }));
		} else {
			const attachment = new MessageAttachment(data, 'website.png');
			await message.channel.send(attachment);
		}
		msg.delete();
	}
};
