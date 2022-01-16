// Dependencies
const axios = require('axios'),
	{ parseVideo } = require('../../structures'),
	rfc3986EncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!'()*]/g, escape),
	Event = require('../../structures/Event');

/**
 * Click button event
 * @event Egglord#autoComplete
 * @extends {Event}
*/
class AutoComplete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {AutocompleteInteraction} button The button that was pressed
	 * @readonly
	*/
	async run(bot, interaction) {
		// Make sure only play & search command trigger autoComplete
		if (!['play', 'search'].includes(interaction.commandName)) return;

		// Get current input and make sure it's not 0
		const searchQuery = interaction.options.getFocused(true).value;
		if (searchQuery.length == 0) return interaction.respond([]);

		let fetched = false;
		const res = await axios.get(`https://www.youtube.com/results?q=${rfc3986EncodeURIComponent(searchQuery)}&hl=en`);
		let html = res.data;

		// try to parse html
		try {
			const data = html.split('ytInitialData = \'')[1]?.split('\';</script>')[0];
			html = data.replace(/\\x([0-9A-F]{2})/ig, (...items) => String.fromCharCode(parseInt(items[1], 16)));
			html = html.replaceAll('\\\\"', '');
			html = JSON.parse(html);
		} catch(e) { null; }

		let videos;
		if (html?.contents?.sectionListRenderer?.contents?.length > 0 && html.contents.sectionListRenderer.contents[0]?.itemSectionRenderer?.contents?.length > 0) {
			videos = html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
			fetched = true;
		}

		// backup/ alternative parsing
		if (!fetched) {
			try {
				videos = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
				fetched = true;
			} catch (e) { null; }
		}
		if (!fetched) {
			try {
				videos = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
				fetched = true;
			} catch(e) { null; }
		}

		const results = [];
		if (!fetched) return interaction.respond(results);
		for (const video of videos) {
			// Only get 5 video suggestions
			if (results.length >= 5) break;
			const parsed = parseVideo(video);
			if (parsed) results.push(parsed);
		}

		// Send back the results to the user
		interaction.respond(results.map(video => ({ name: video.title, value: interaction.commandName == 'play' ? video.url : video.title })));
	}
}

module.exports = AutoComplete;
