const Puppeteer = require('puppeteer');

class Snowshot {

	constructor(options = { removeTags: [], removeAttributes: [], args: [], height: 800, width: 1280 }, puppeteerOptions = {}) {
		this.options = options;
		this.puppeteerOptions = puppeteerOptions;
		this.rawHTML = '';
	}

	async screenshot(url = false, options) {
		console.log('screenshot');
		if (options && typeof options !== 'object') throw new Error('Option type must be an object');
		if (options && options['path']) delete options['path'];
		const browser = await Puppeteer.launch(this.puppeteerOptions);
		const page = await browser.newPage();
		await page.setViewport({
			width: this.options.width,
			height: this.options.height,
		});
		if (!url) {
			if (!this.rawHTML) {
				await browser.close();
				console.log('No html content found, Please load HTML before using screenshot method!');
				return false;
			}
			await page.setContent(this.rawHTML);
			const buffer = await page.screenshot(options);
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
				console.log('Not a website');
				return false;
			}
			const buffer = await page.screenshot(options);
			await browser.close();
			return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
		}
	}
}

module.exports = Snowshot;
