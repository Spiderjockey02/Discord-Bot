// Dependencies
import chalk from 'chalk';
import moment from 'moment';
import fileLog from 'simple-node-logger'
const log = fileLog.createRollingFileLogger({
	logDirectory: './src/utils/logs',
	fileNamePattern: 'roll-<DATE>.log',
	dateFormat: 'YYYY.MM.DD',
})

type LoggerType = 'log' | 'warn' | 'error' | 'debug' | 'cmd' | 'ready'

export default class Logger {
	log(content: string, type: LoggerType = 'log') {
		const timestamp = `[${moment().format('HH:mm:ss:SSS')}]:`;
		switch (type) {
			case 'log':
				log.info(content);
				console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
				break;
			case 'warn':
				log.warn(content);
				console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
				break;
			case 'error':
				log.error(content);
				console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
				break;
			case 'debug':
				log.debug(content);
				console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
				break;
			case 'cmd':
				log.info(content);
				console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
				break;
			case 'ready':
				log.info(content);
				console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
				break;
			default:
				break;
		}
	}

	ready = (content: string) => this.log(content, 'ready');
	warn = (content: string) => this.log(content, 'warn');
	error = (content: string) => this.log(content, 'error');
	debug = (content: string) => this.log(content, 'debug');
}