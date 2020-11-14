const Puppeteer = require('puppeteer');

class Snowshot {
	async screenshot(url = false) {
		try {
			const options = { removeTags: [], removeAttributes: [], args: [], height: 800, width: 1280 };
			const rawHTML = '';
			const userAgent = 'Chrome';
			const puppeteerOptions = {};
			if (options && typeof options !== 'object') throw console.log('Option type must be an object');
			if (options && options['path']) delete options['path'];
			const browser = await Puppeteer.launch(puppeteerOptions);
			const page = await browser.newPage();
			await page.setViewport({
				width: options.width,
				height: options.height,
			});
			if (!url) {
				if (!rawHTML) {
					await browser.close();
					return console.log('No html content found, Please load HTML before using screenshot method!');
				}
				await page.setContent(rawHTML);
				const buffer = await page.screenshot(options);
				await browser.close();
				return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
			} else {
				if (typeof url !== 'string') {
					await browser.close();
					return console.log(`URL type must be a string, received ${typeof url}`);
				}
				if (userAgent) await page.setUserAgent(userAgent);
				await page.goto(url);
				const buffer = await page.screenshot(options);
				await browser.close();
				return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
			}
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = Snowshot;
