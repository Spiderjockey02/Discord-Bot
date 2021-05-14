const { Structure } = require('erela.js');

module.exports = Structure.extend('Player', Player => {
	class player extends Player {
		constructor(...args) {
			super(...args);
			// extra settings
			this.speed = 1;
			this.twentyFourSeven = false;
			this.previousTracks = [];
			// for bot leave function
			this.timeout = null;
		}

		// add filters
		setFilter(body = {}) {
			this.node.send({
				op: 'filters',
				guildId: this.guild.id || this.guild,
				...body,
			});
			return this;
		}

		// reset filters
		resetFilter() {
			this.speed = 1;
			this.node.send({
				op: 'filters',
				guildId: this.guild.id || this.guild,
				...{},
			});
			return this;
		}

		// Adds a song to previousTracks
		addPreviousSong(song) {
			this.previousTracks.push(song);
			return this;
		}

		// Change playback speed
		setSpeed(value) {
			this.speed = value;
			this.node.send({
				op: 'filters',
				guildId: this.guild.id || this.guild,
				timescale: { speed: value },
			});
			return this;
		}
	}
	return player;
});
