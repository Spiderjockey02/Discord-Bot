// Dependencies
const Puppeteer = require('puppeteer'),
	{ MessageAttachment } = require('discord.js'),
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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// make sure a website was entered
		if (!args[0]) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// send 'waiting' message
		const msg = await message.channel.send('Creating screenshot of website.');

		// try and create screenshot
		screenshotWebsite(args[0]).then(async data => {
			if (!data) {
				message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			} else {
				const attachment = new MessageAttachment(data, 'website.png');
				await message.channel.send(attachment);
			}
			msg.delete();
		});

		// screenshot function
		async function screenshotWebsite(url) {
			try {
				const browser = await Puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome.exe' });
				const page = await browser.newPage();
				await page.setViewport({
					width: 1280,
					height: 720,
				});
				await page.goto(url);
				const r = await page.screenshot();
				await browser.close();
				return r;
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: 'screenshot' has error: ${err.message}.`);
			}
		}
	}
};
