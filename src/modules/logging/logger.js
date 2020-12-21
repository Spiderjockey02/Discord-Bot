// Dependecies
const chalk = require('chalk');
const moment = require('moment');
const opts = {
	logDirectory:'./src/modules/logging/logs',
	fileNamePattern:'roll-<DATE>.log',
	dateFormat:'YYYY.MM.DD',
};
exports.log = (content, type = 'log') => {
	if (content == 'error') return;
	const timestamp = `[${moment().format('HH:mm:ss')}]:`;
	const log = require('simple-node-logger').createRollingFileLogger(opts);
	switch (type) {
	case 'log': {
		console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
		log.info(content);
		return;
	}
	case 'warn': {
		console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
		log.warn(content);
		return;
	}
	case 'error': {
		console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
		log.error(content);
		return;
	}
	case 'debug': {
		console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
		log.debug(content);
		return;
	}
	case 'cmd': {
		console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
		log.info(content);
		return;
	}
	case 'ready': {
		console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
		log.info(content);
		return;
	}
	default: throw new TypeError('Logger type must be either warn, debug, log, ready, cmd or error.');
	}
};

exports.warn = (...args) => this.log(...args, 'warn');

exports.error = (...args) => this.log(...args, 'error');

exports.debug = (...args) => this.log(...args, 'debug');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');
