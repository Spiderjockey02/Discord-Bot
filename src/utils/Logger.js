// Dependecies
const chalk = require('chalk');
const moment = require('moment');

exports.log = (content, type = 'log') => {
	if (content == 'error') return;
	const timestamp = `[${moment().format('HH:mm:ss:SSS')}]:`;
	if (type == 'log') {
		return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
	} else if (type == 'warn') {
		return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
	} else if (type == 'error') {
		return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
	} else if (type == 'debug') {
		return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
	} else if (type == 'cmd') {
		return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
	} else if (type == 'ready') {
		return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
	}
};

exports.warn = (...args) => this.log(...args, 'warn');

exports.error = (...args) => this.log(...args, 'error');

exports.debug = (...args) => this.log(...args, 'debug');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');
