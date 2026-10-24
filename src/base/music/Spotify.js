const axios = require('axios');

const URL_PATTERN = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist)\/([a-zA-Z0-9]+)/;
const URI_PATTERN = /^spotify:(track|album|playlist|artist):([a-zA-Z0-9]+)/;

class Spotify {
	constructor(config = {}) {
		this.clientId = config.clientId || '';
		this.clientSecret = config.clientSecret || '';
		this.token = null;
		this.tokenExpiresAt = 0;
	}

	get configured() {
		return Boolean(this.clientId && this.clientSecret);
	}

	static parseURL(url) {
		const match = String(url).match(URL_PATTERN) || String(url).match(URI_PATTERN);
		return match ? { type: match[1], id: match[2] } : null;
	}

	async request(endpoint, params = {}) {
		if (Date.now() >= this.tokenExpiresAt) {
			try {
				const { data } = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
					headers: {
						'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					timeout: 10000,
				});
				this.token = data.access_token;
				// Refresh a minute early so a request never goes out with an expired token
				this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
			} catch {
				throw new Error('Spotify API authentication failed.');
			}
		}

		const { data } = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
			headers: { Authorization: `Bearer ${this.token}` },
			params,
			timeout: 15000,
		});
		return data;
	}

	// Resolves a Spotify link to { name, tracks }
	async getFromURL(url, limit = 100) {
		const ref = Spotify.parseURL(url);
		if (!ref) return { name: null, tracks: [] };

		switch (ref.type) {
			case 'track':
				return { name: null, tracks: [this.formatTrack(await this.request(`tracks/${ref.id}`))] };
			case 'album': {
				const album = await this.request(`albums/${ref.id}`);
				const tracks = album.tracks.items.slice(0, limit).map(track => this.formatTrack({ ...track, album }));
				return { name: album.name, tracks };
			}
			case 'playlist': {
				const playlist = await this.request(`playlists/${ref.id}`);
				const tracks = playlist.tracks.items
					.filter(item => item.track?.type === 'track')
					.slice(0, limit)
					.map(item => this.formatTrack(item.track));
				return { name: playlist.name, tracks };
			}
			case 'artist': {
				const [artist, top] = await Promise.all([
					this.request(`artists/${ref.id}`),
					this.request(`artists/${ref.id}/top-tracks`, { market: 'US' }),
				]);
				return { name: `${artist.name} - Top tracks`, tracks: top.tracks.slice(0, limit).map(track => this.formatTrack(track)) };
			}
			default:
				return { name: null, tracks: [] };
		}
	}

	formatTrack(track) {
		const title = track.name || 'Unknown track';
		const author = track.artists?.map(artist => artist.name).join(', ') || 'Unknown artist';
		return {
			title,
			author,
			album: track.album?.name || null,
			duration: Number(track.duration_ms) || 0,
			uri: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
			identifier: track.id,
			thumbnail: track.album?.images?.[0]?.url || null,
			isSeekable: true,
			provider: 'spotify',
			// Played from the matching YouTube upload, looked up when the track starts
			query: `${title} ${author}`,
		};
	}
}

module.exports = Spotify;
