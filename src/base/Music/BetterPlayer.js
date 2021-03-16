const { Structure } = require('erela.js');

module.exports = Structure.extend('Player', Player => {
	class boneeplayer extends Player {
		constructor(...args) {
			super(...args);
			this.musicTrivia = false;
			this.speed = 1;
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
			this.node.send({
				op: 'filters',
				guildId: this.guild.id || this.guild,
				...{},
			});
			return this;
		}
	}
	return boneeplayer;
});
