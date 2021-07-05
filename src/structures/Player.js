// Dependecies
const { Structure } = require('erela.js');

module.exports = Structure.extend('Player', Player => {
	class CustomPlayer extends Player {
		constructor(...args) {
			super(...args);
			// extra settings
			this.twentyFourSeven = false;
			this.previousTracks = [];
			// for bot leave function
			this.timeout = null;
			// for filters
			this.speed = 1;
			this.bassboost = false;
			this.nightcore = false;
			this.vaporwave = false;
		}

		// update bassboost filter
		setBassboost(value) {
			if (typeof (value) == 'boolean') {
				if (value) {
					this.setFilter({
						equalizer: [
							...Array(6).fill(0).map((n, i) => ({ band: i, gain: 0.65 })),
							...Array(9).fill(0).map((n, i) => ({ band: i + 6, gain: 0 })),
						],
					});
					this.bassboost = true;
				} else {
					this.resetFilter();
					this.bassboost = false;
				}
			} else {
				this.setFilter({
					equalizer: [
						...Array(6).fill(0).map((n, i) => ({ band: i, gain: value })),
						...Array(9).fill(0).map((n, i) => ({ band: i + 6, gain: 0 })),
					],
				});
				this.bassboost = true;
			}
			return this;
		}

		// update nightcore filter
		setNightcore(value) {
			if (value) {
				this.setFilter({
					equalizer: [
						{ band: 1, gain: 0.3 },
						{ band: 0, gain: 0.3 },
					],
					timescale: { pitch: 1.2 },
					tremolo: { depth: 0.3, frequency: 14 },
				});
				this.nightcore = true;
			} else {
				this.resetFilter();
				this.nightcore = false;
			}
			return this;
		}

		// update vaporwave filter
		setVaporwave(value) {
			if (value) {
				this.setFilter({
					equalizer: [
						{ band: 1, gain: 0.3 },
						{ band: 0, gain: 0.3 },
					],
					timescale: { pitch: 0.5 },
					tremolo: { depth: 0.3, frequency: 14 },
				});
				this.vaporwave = true;
			} else {
				this.resetFilter();
				this.vaporwave = false;
			}
			return this;
		}

		// send lavalink the new filters
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
	return CustomPlayer;
});
