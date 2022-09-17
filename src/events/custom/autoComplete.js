// Dependencies
const axios = require('axios'),
	{ parseVideo } = require('../../structures'),
	rfc3986EncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!'()*]/g, escape),
	radioStations = require('../../assets/json/radio_streams_yuck.json'),
	{ colourNames } = require('../../assets/json/colours.json'),
	{ PlaylistSchema } = require('../../database/models'),
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
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {AutocompleteInteraction} button The button that was pressed
	 * @readonly
	*/
	async run(bot, interaction) {
		// Make sure only play & search command trigger autoComplete
		switch (interaction.commandName) {
			case 'play':
			case 'search': {
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
				} catch { null; }

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
					} catch { null; }
				}
				if (!fetched) {
					try {
						videos = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
						fetched = true;
					} catch { null; }
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
				break;
			}
			case 'radio': {
				const input = interaction.options.getFocused(true).value,
					stations = radioStations.map(i => i.name).filter(i => i.toLowerCase().startsWith(input.toLowerCase())).slice(0, 10);

				// Send back the responses
				interaction.respond(stations.map(i => ({ name: i, value: radioStations.find(rad => rad.name == i).audio })));
				break;
			}
			case 'addrole': {
				const input = interaction.options.getFocused(true).value,
					colour = Object.keys(colourNames).filter(i => i.toLowerCase().startsWith(input.toLowerCase())).slice(0, 10);

				// Send back the responses
				interaction.respond(colour.map(i => ({ name: i, value: Object.entries(colourNames).find(c => c[0] == i)[1] })));
				break;
			}
			case 'help': {
				const input = interaction.options.getFocused(true).value,
					commands = [...bot.commands.keys()].filter(i => i.toLowerCase().startsWith(input.toLowerCase())).slice(0, 10);

				// Send back the responses
				interaction.respond(commands.map(i => ({ name: i, value: i })));
				break;
			}
			case 'docs': {
				break;
			}
			case 'playlist': {
				// Handle autocomplete for finding playlist name
				const playlists = await PlaylistSchema.find({ creator: interaction.user.id });

				if (playlists) interaction.respond(playlists.map(i => ({ name: i.name, value: i.name }))); else interaction.respond([]);
				break;
			}
			default:
				interaction.respond({ name: 'error', value: 'error fetching results' });
		}
	}
}

module.exports = AutoComplete;
