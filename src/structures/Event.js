module.exports = class Event {

	constructor(bot, name, options = {}) {
		this.name = name;
		this.type = options.once ? 'once' : 'on';
		this.emitter = (typeof options.emitter === 'string' ? this.bot[options.emitter] : options.emitter) || this.bot;
	}

	// eslint-disable-next-line no-unused-vars
	async run(...args) {
		throw new Error(`Event: ${this.help.name} does not have a run method`);
	}
};
