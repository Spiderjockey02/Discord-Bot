// Dependecies
const chalk = require('chalk');
const moment = require('moment');
exports.log = (content, type = 'log') => {
	if (content == 'error') return;
	const timestamp = `[${moment().format('HH:mm:ss')}]:`;
	if (type == 'log') {
		console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
		return;
	} else if (type == 'warn') {
		console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
		return;
	} else if (type == 'error') {
		console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
		return;
	} else if (type == 'debug') {
		console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
		return;
	} else if (type == 'cmd') {
		console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
		return;
	} else if (type == 'ready') {
		console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
		return;
	}
};

exports.warn = (...args) => this.log(...args, 'warn');

exports.error = (...args) => this.log(...args, 'error');

exports.debug = (...args) => this.log(...args, 'debug');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');
