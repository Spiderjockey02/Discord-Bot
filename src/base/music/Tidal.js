const axios = require('axios');
const crypto = require('crypto');
const { isExactQueryMatch } = require('./TrackMatch');

class Tidal {
	constructor(config = {}) {
		this.url = String(config.url || '').replace(/\/+$/, '');
		this.username = config.username || '';
		this.password = config.password || '';
	}

	get configured() {
		return Boolean(this.url && this.username && this.password);
	}

	// Fresh token auth params for every request (token = md5(password + salt))
	authParams() {
		const salt = crypto.randomBytes(8).toString('hex');
		return {
			u: this.username,
			t: crypto.createHash('md5').update(this.password + salt).digest('hex'),
			s: salt,
			v: '1.16.1',
			c: 'Egglord',
		};
	}

	async request(endpoint, params = {}) {
		let data;
		try {
			const response = await axios.get(`${this.url}/rest/${endpoint}`, {
				params: { ...this.authParams(), f: 'json', ...params },
				timeout: 15000,
			});
			data = response.data?.['subsonic-response'];
		} catch (error) {
			throw new Error(`Tidal ${endpoint} failed (${error.response?.status || error.message})`);
		}

		if (!data || data.status !== 'ok') {
			throw new Error(`Tidal ${endpoint} failed (${data?.error?.message || 'bad response'})`);
		}
		return data;
	}

	// Any Tidal link, including short links and mixes that parseURL can't read
	static isTidalURL(query) {
		try {
			return /(^|\.)tidal\.(com|link)$/.test(new URL(query).hostname.toLowerCase());
		} catch {
			return false;
		}
	}

	// Parses tidal.com / listen.tidal.com links into { type: 'track' | 'album' | 'playlist', id }
	static parseURL(query) {
		let url;
		try {
			url = new URL(query);
		} catch {
			return null;
		}
		if (!/(^|\.)tidal\.com$/.test(url.hostname.toLowerCase())) return null;

		const pathname = url.pathname.replace(/^\/browse/, '');
		// Album links that point at a single track: /album/123/track/456
		const trackInAlbum = pathname.match(/^\/album\/\d+\/track\/(\d+)/);
		if (trackInAlbum) return { type: 'track', id: trackInAlbum[1] };

		const match = pathname.match(/^\/(track|album)\/(\d+)/) || pathname.match(/^\/(playlist)\/([0-9a-f-]{36})/i);
		return match ? { type: match[1], id: match[2] } : null;
	}

	// Resolves a Tidal link to { name, tracks }
	async getFromURL(query, limit = 100) {
		const ref = Tidal.parseURL(query);
		if (!ref) return { name: null, tracks: [] };

		if (ref.type === 'track') {
			const data = await this.request('getSong', { id: ref.id });
			return { name: null, tracks: data.song ? [this.formatTrack(data.song)] : [] };
		}

		const container = ref.type === 'album'
			? (await this.request('getAlbum', { id: ref.id })).album
			: (await this.request('getPlaylist', { id: ref.id })).playlist;
		const songs = (ref.type === 'album' ? container?.song : container?.entry) || [];

		return {
			name: container?.name || null,
			tracks: songs.slice(0, limit).map(song => this.formatTrack(song)),
		};
	}

	async search(query, limit = 1) {
		const data = await this.request('search3', {
			query,
			songCount: limit,
			albumCount: 0,
			artistCount: 0,
		});
		return (data.searchResult3?.song || []).slice(0, limit).map(song => this.formatTrack(song));
	}

	// First of the top results that exactly matches the query, or null
	async findExact(query) {
		const results = await this.search(query, 5);
		return results.find(track => isExactQueryMatch(query, track)) || null;
	}

	formatTrack(song) {
		const id = String(song.id);
		return {
			title: song.title || 'Unknown track',
			author: song.artist || 'Unknown artist',
			album: song.album || null,
			duration: Math.round(Number(song.duration) || 0) * 1000,
			uri: `https://tidal.com/browse/track/${id}`,
			identifier: id,
			thumbnail: Tidal.coverUrl(song.coverArt),
			isSeekable: true,
			provider: 'tidal',
		};
	}

	// Plain-text lyrics for a Tidal track ID, or null. Synced (LRC) lyrics have their timestamps stripped.
	async getLyrics(id) {
		const data = await this.request('getLyrics', { id: String(id) });
		const text = (data.lyrics?.value || '')
			.split('\n')
			.map(line => line.replace(/^(\[\d+:\d+(?:[.:]\d+)?\])+\s*/, '').trimEnd())
			.join('\n')
			.trim();
		return text || null;
	}

	// Tidal cover IDs are UUIDs that map straight to their public image CDN
	static coverUrl(coverArt) {
		if (!coverArt || !/^[0-9a-f-]{36}$/i.test(coverArt)) return null;
		return `https://resources.tidal.com/images/${coverArt.replace(/-/g, '/')}/640x640.jpg`;
	}

	getStream(id) {
		const params = new URLSearchParams({ ...this.authParams(), id: String(id) });
		return { url: `${this.url}/rest/stream?${params}` };
	}
}

module.exports = Tidal;
