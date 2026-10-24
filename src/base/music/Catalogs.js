const axios = require('axios');

function catalogTrack({ title, author, duration, uri, identifier, thumbnail, album }, provider) {
	title = title || 'Unknown track';
	author = author || 'Unknown artist';
	return {
		title,
		author,
		album: album || null,
		duration: Number(duration) || 0,
		uri,
		identifier: String(identifier),
		thumbnail: thumbnail || null,
		isSeekable: true,
		provider,
		query: `${title} ${author}`,
	};
}

class Deezer {
	static async request(endpoint, params = {}) {
		const { data } = await axios.get(`https://api.deezer.com/${endpoint}`, { params, timeout: 15000 });
		if (data?.error) throw new Error(`Deezer: ${data.error.message || 'request failed'}`);
		return data;
	}

	// deezer.page.link / link.deezer.com share links redirect to the real page
	static async expand(url) {
		if (/^(www\.)?deezer\.com$/.test(new URL(url).hostname)) return url;
		const response = await axios.get(url, { maxRedirects: 5, timeout: 10000, validateStatus: () => true });
		return response.request?.res?.responseUrl || url;
	}

	static parseURL(url) {
		const match = new URL(url).pathname.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/(track|album|playlist|artist)\/(\d+)/i);
		return match ? { type: match[1].toLowerCase(), id: match[2] } : null;
	}

	static formatTrack(track, album) {
		return catalogTrack({
			title: track.title,
			author: track.artist?.name,
			duration: Number(track.duration) * 1000,
			uri: track.link || `https://www.deezer.com/track/${track.id}`,
			identifier: track.id,
			thumbnail: (track.album || album)?.cover_xl,
			album: (track.album || album)?.title,
		}, 'deezer');
	}

	static async getFromURL(url, limit = 100) {
		const ref = this.parseURL(await this.expand(url));
		if (!ref) throw new Error('That Deezer link isn\'t a track, album, playlist or artist.');

		switch (ref.type) {
			case 'track':
				return { name: null, tracks: [this.formatTrack(await this.request(`track/${ref.id}`))] };
			case 'album': {
				const album = await this.request(`album/${ref.id}`);
				return { name: album.title, tracks: album.tracks.data.slice(0, limit).map(track => this.formatTrack(track, album)) };
			}
			case 'playlist': {
				const [playlist, tracks] = await Promise.all([
					this.request(`playlist/${ref.id}`),
					this.request(`playlist/${ref.id}/tracks`, { limit }),
				]);
				return { name: playlist.title, tracks: tracks.data.map(track => this.formatTrack(track)) };
			}
			default: {
				const [artist, top] = await Promise.all([
					this.request(`artist/${ref.id}`),
					this.request(`artist/${ref.id}/top`, { limit: Math.min(limit, 50) }),
				]);
				return { name: `${artist.name} - Top tracks`, tracks: top.data.map(track => this.formatTrack(track)) };
			}
		}
	}
}

class AppleMusic {
	// music.apple.com/{country}/(album|song|artist)/{slug}/{id}[?i={trackId}]
	static parseURL(url) {
		const parsed = new URL(url);
		const match = parsed.pathname.match(/^\/([a-z]{2})\/(album|song|artist|playlist)\/(?:[^/]+\/)?([\w.-]+)/i);
		if (!match) return null;
		const [, country, type, id] = match;
		const trackId = parsed.searchParams.get('i');
		if (trackId) return { country, type: 'song', id: trackId };
		return { country, type: type.toLowerCase(), id };
	}

	static async lookup(params) {
		const { data } = await axios.get('https://itunes.apple.com/lookup', { params, timeout: 15000 });
		return data?.results || [];
	}

	static formatTrack(song) {
		return catalogTrack({
			title: song.trackName,
			author: song.artistName,
			duration: song.trackTimeMillis,
			uri: song.trackViewUrl ? song.trackViewUrl.replace(/&uo=\d+$/, '') : `https://music.apple.com/song/${song.trackId}`,
			identifier: song.trackId,
			thumbnail: song.artworkUrl100?.replace(/100x100/, '600x600'),
			album: song.collectionName,
		}, 'applemusic');
	}

	static async getFromURL(url, limit = 100) {
		const ref = this.parseURL(url);
		if (!ref) throw new Error('That Apple Music link isn\'t a song, album or artist.');
		if (ref.type === 'playlist') throw new Error('Apple Music playlists can only be played through a SongLink API.');

		const results = await this.lookup({
			id: ref.id,
			country: ref.country,
			...(ref.type === 'song' ? {} : { entity: 'song', limit }),
		});
		const songs = results.filter(result => result.wrapperType === 'track' && result.kind === 'song');
		if (ref.type === 'song') return { name: null, tracks: songs.slice(0, 1).map(song => this.formatTrack(song)) };

		const container = results.find(result => result.wrapperType !== 'track');
		const name = ref.type === 'album' ? container?.collectionName : `${container?.artistName} - Top tracks`;
		return { name: name || 'Apple Music', tracks: songs.slice(0, limit).map(song => this.formatTrack(song)) };
	}
}

module.exports = { Deezer, AppleMusic };
