const Puppeteer = require('puppeteer');
const { MessageAttachment } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// make sure a website was entered
	if (!args[0]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('screenshot').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// send 'waiting' message
	const msg = await message.channel.send('Creating screenshot of website.');

	// try and create screenshot
	screenshot(args[0]).then(async data => {
		if (!data) {
			if (message.deletable) message.delete();
			msg.delete();
			return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		} else {
			const attachment = new MessageAttachment(data, 'website.png');
			await message.channel.send(attachment);
			msg.delete();
		}
	});

	// screenshot function
	async function screenshot(url) {
		const browser = await Puppeteer.launch({});
		const page = await browser.newPage();
		await page.setViewport({
			width: 1280,
			height: 800,
		});

		if (!url) {
			if (!this.rawHTML) {
				await browser.close();
				console.log('No html content found, Please load HTML before using screenshot method!');
				return false;
			}
			await page.setContent(this.rawHTML);
			const buffer = await page.screenshot();
			await browser.close();
			return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
		} else {
			if (typeof url !== 'string') {
				await browser.close();
				console.log(`URL type must be a string, received ${typeof url}`);
				return false;
			}
			try {
				await page.goto(url);
			} catch (e) {
				await page.goto('https://' + url);
			}
			const buffer = await page.screenshot();
			await browser.close();
			return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
		}
	}
};

module.exports.config = {
	command: 'screenshot',
	aliases: ['ss'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Screenshot',
	category: 'Fun',
	description: 'Get a screenshot of a website.',
	usage: '${PREFIX}screenshot <url>',
};
