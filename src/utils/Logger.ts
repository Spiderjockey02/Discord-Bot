// Dependencies
import chalk from 'chalk';
import moment from 'moment';
import fileLog from 'simple-node-logger';
import onFinished from 'on-finished';
import CONSTANTS from './CONSTANTS';
import { ExtendedRequest, ExtendedResponse } from 'src/types';
const log = fileLog.createRollingFileLogger({
	logDirectory: './src/utils/logs',
	fileNamePattern: 'roll-<DATE>.log',
	dateFormat: 'YYYY.MM.DD',
});

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

	async connection(req: ExtendedRequest, res: ExtendedResponse) {
		// Update request
		await this.addEndTime(req);
		await this.addEndTime(res);

		// Get additional information
		const	method = req.method,
			url = req.originalUrl || req.url,
			status = res.statusCode,
			color = this.getStatusColor(status),
			requester = this.getIP(req);

		// How long did it take for the page to load
		let response_time;
		if (res._endTime && req._endTime) response_time = (res._endTime + req._endTime) - (res._startTime + req._startTime);

		if (['bgCyan', 'bgGreen', 'dim'].includes(color)) {
			this.log(`${requester} ${method} ${url} ${chalk[color](status)} - ${(response_time ?? '?')} ms`, 'log');
		} else if (color == 'bgMagenta') {
			this.warn(`${requester} ${method} ${url} ${chalk[color](status)} - ${(response_time ?? '?')} ms`);
		} else {
			this.error(`${requester} ${method} ${url} ${chalk[color](status)} - ${(response_time ?? '?')} ms`);
		}
	}

	getStatusColor(status: number) {
		return status >= 500 ? 'bgRed' :
			status >= 400 ? 'bgMagenta' :
				status >= 300 ? 'bgCyan' :
					status >= 200 ? 'bgGreen' :
						'dim';
	}

	async addEndTime(obj: ExtendedRequest | ExtendedResponse) {
		await new Promise((resolve) => {
			onFinished(obj, function() {
				obj._endTime = new Date().getTime();
				resolve('');
			});
		});
	}

	getIP(req: ExtendedRequest) {
		if (req.headers) {
			// Check forwarded header
			if (req.headers['x-forwarded-for'] && CONSTANTS.ipv4Regex.test(req.headers['x-forwarded-for'][0] ?? '')) return req.headers['x-forwarded-for'];

			// Remote address checks.
			if (req.socket) {
				if (CONSTANTS.ipv4Regex.test(req.socket.remoteAddress ?? '')) return req.socket.remoteAddress;
				if (req.socket && CONSTANTS.ipv4Regex.test(req.socket.remoteAddress ?? '')) return req.socket.remoteAddress;
			}

			return req.ip;
		}
	}

	ready = (content: string) => this.log(content, 'ready');
	warn = (content: string) => this.log(content, 'warn');
	error = (content: string) => this.log(content, 'error');
	debug = (content: string) => this.log(content, 'debug');
}