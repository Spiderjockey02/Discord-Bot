// Dependecies
const fetch = require('node-fetch').default,
	{ JSDOM } = require('jsdom'),
	Command = require('../../structures/Command.js');

module.exports = class Test extends Command {
	constructor(bot) {
		super(bot, {
			name: 'test',
			dirname: __dirname,
			ownerOnly: true,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'For testing new commands',
			usage: 'test',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args) {
		class Facebook {
			constructor() {
				throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
			}

			static validateURL(url) {
				const REGEX = /(https?:\/\/)(www\.|m\.)?(facebook|fb).com\/.*\/videos\/.*/;
				if (!url || typeof url !== 'string') return false;
				return REGEX.test(url);
			}

			static async getInfo(url) {
				if (!Facebook.validateURL(url)) throw new Error('Invalid url.');
				try {
					const html = await Facebook._parseHTML(url);
					const document = new JSDOM(html).window.document;
					const rawdata = document.querySelector('script[type="application/ld+json"]').innerHTML;
					const json = JSON.parse(rawdata);

					const obj = {
						title: document.querySelector('meta[property="og:title"]').attributes.item(1).value,
						thumbnail: json.thumbnailUrl,
						streamURL: json.url,
						url: html.split('",page_uri:"')[1].split('",')[0],
						author: json.author.name,
					};

					return obj;
				} catch (err) {
					console.log(err);
					return null;
				}
			}

			static async _parseHTML(url) {
				const res = await fetch(url.replace('/m.', '/'));
				return await res.text();
			}
		}

		const info = await Facebook.getInfo(args[0]);
		message.channel.send(info.streamURL);
	}
};
