const axios = require('axios');

class SongLink {
	constructor(config = {}) {
		this.apiUrl = String(config.apiUrl || '').replace(/\/+$/, '');
		this.apiKey = config.apiKey || '';
	}

	get configured() {
		return Boolean(this.apiUrl);
	}

	// The provider id a link belongs to, used for the disabledProviders setting
	static getProviderId(query) {
		if (/^spotify:[a-z]+:/i.test(query)) return 'spotify';
		try {
			const hostname = new URL(query).hostname.toLowerCase();
			if (/^(open|play)\.spotify\.com$|^spotify(\.app)?\.link$/.test(hostname)) return 'spotify';
			if (/^(geo\.)?(music|itunes)\.apple\.com$|^apple\.co$/.test(hostname)) return 'applemusic';
			if (/(^|\.)deezer\.com$|^(deezer|dzr)\.page\.link$/.test(hostname)) return 'deezer';
			if (/(^|\.)tidal\.com$|^tidal\.link$/.test(hostname)) return 'tidal';
		} catch {
			return null;
		}
		return null;
	}

	/**
	 * @returns {Promise<{type: string, title: string, author: string, thumbnail: string, pageUrl: string, youtubeUrl: string, tidalUrl: string}>}
	 */
	async lookup(url) {
		const params = { url, songIfSingle: true };
		if (this.apiKey) params.key = this.apiKey;

		let data;
		try {
			({ data } = await axios.get(`${this.apiUrl}/links`, { params, timeout: 20000 }));
		} catch (error) {
			const status = error.response?.status;
			const code = error.response?.data?.code;
			if (status === 429) throw new Error('SongLink is rate limiting this bot, try again in a minute.');
			if (status === 401) throw new Error('The configured SongLink API key is invalid.');
			if (code === 'could_not_resolve_entity' || code === 'invalid_url' || status === 404 || status === 400) {
				throw new Error('SongLink could not find that song.');
			}
			throw new Error(`SongLink lookup failed (${code || status || error.message}).`);
		}

		const entity = data.entitiesByUniqueId?.[data.entityUniqueId] || {};
		const links = data.linksByPlatform || {};
		return {
			type: entity.type || 'song',
			title: entity.title || null,
			author: entity.artistName || null,
			thumbnail: entity.thumbnailUrl || null,
			pageUrl: data.pageUrl || null,
			youtubeUrl: links.youtube?.url || SongLink.toYouTubeURL(links.youtubeMusic?.url),
			tidalUrl: links.tidal?.url || null,
		};
	}

	// music.youtube.com links -> www.youtube.com
	static toYouTubeURL(url) {
		if (!url) return null;
		try {
			const parsed = new URL(url);
			if (!parsed.hostname.endsWith('youtube.com')) return null;
			parsed.hostname = 'www.youtube.com';
			return parsed.toString();
		} catch {
			return null;
		}
	}
}

module.exports = SongLink;
