const axios = require('axios');

const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map();

// Strips the extras video titles carry ("(Official Video)", "[4K]", ...) that lyric sites don't have
function cleanTitle(title = '') {
	return String(title)
		.replace(/\(.*?\)|\[.*?\]/g, '')
		.replace(/\b(official (music )?(video|audio)|lyric video|lyrics|visualizer|4k|hd)\b/gi, '')
		.replace(/\s+/g, ' ')
		.trim();
}

// Lyrics from Tidal for tracks played from Tidal
async function fromTidal(manager, track) {
	const { tidal } = manager;
	if (track.provider !== 'tidal' || !/^\d+$/.test(String(track.identifier)) || !tidal.configured) return null;
	const lyrics = await tidal.getLyrics(track.identifier);
	return lyrics ? { title: track.title, artist: track.author, lyrics, source: 'Tidal', url: track.uri } : null;
}

// LRCLIB (https://lrclib.net), a free lyrics database that needs no key
async function fromLrclib(track) {
	const title = cleanTitle(track.title) || track.title;
	const attempts = track.author
		? [{ track_name: title, artist_name: track.author }, { q: `${title} ${track.author}` }, { track_name: title }]
		: [{ q: title }];

	for (const params of attempts) {
		const { data } = await axios.get('https://lrclib.net/api/search', {
			params,
			timeout: 8000,
			headers: { 'User-Agent': 'Egglord (https://github.com/Spiderjockey02/Discord-Bot)' },
		});
		const match = (data || []).find(result => result.plainLyrics);
		if (match) {
			return {
				title: match.trackName,
				artist: match.artistName,
				lyrics: match.plainLyrics.trim(),
				source: 'LRCLIB',
				url: null,
			};
		}
	}
	return null;
}

// The Egglord API, when the bot has a key for it
async function fromEgglord(bot, track) {
	if (!bot.config.api_keys?.masterToken) return null;
	const info = await bot.fetch('info/lyrics', { title: [cleanTitle(track.title) || track.title, track.author].filter(Boolean).join(' ') });
	if (!info?.lyrics?.length) return null;
	return { title: info.name, artist: track.author, lyrics: info.lyrics.join('\n'), source: 'Egglord', url: info.url };
}

/**
 * Finds the lyrics of a song: Tidal for Tidal tracks, then LRCLIB, then the Egglord API.
 * @param {bot} bot The instantiating client
 * @param {{title: string, author?: string, provider?: string, identifier?: string, uri?: string}} track The song
 * @returns {Promise<?{title: string, artist: string, lyrics: string, source: string, url: string}>}
*/
module.exports = async function fetchLyrics(bot, track) {
	const key = `${track.provider || ''}:${track.identifier || ''}:${track.title}:${track.author || ''}`.toLowerCase();
	const cached = cache.get(key);
	if (cached && Date.now() - cached.at < CACHE_TTL) return cached.result;

	let result = null;
	for (const source of [() => fromTidal(bot.manager, track), () => fromLrclib(track), () => fromEgglord(bot, track)]) {
		try {
			result = await source();
		} catch (err) {
			if (bot.config.debug) bot.logger.debug(`Lyrics lookup failed: ${err.message}`);
		}
		if (result) break;
	}

	cache.set(key, { result, at: Date.now() });
	// Maps keep insertion order, so the oldest lookup goes first
	if (cache.size > 500) cache.delete(cache.keys().next().value);
	return result;
};

module.exports.cleanTitle = cleanTitle;
