// Dependencies
import { Router } from 'express';
import fs from 'fs';
const router = Router();

export function run() {
	router.get('/', async (req, res) => {
		const date = req.query.date ?? new Date().toLocaleDateString('EN-GB').split('/').reverse().join('.');

		if (fs.existsSync(`${process.cwd()}/src/utils/logs/roll-${date}.log`)) {
			const data = fs.readFileSync(`${process.cwd()}/src/utils/logs/roll-${date}.log`, 'utf8');
			res.json({ date, logs: data.split(' \r\n') });
		} else {
			res.status(400).json({ error: `The date: ${date} does not have a corresponding log file.` });
		}
	});

	return router;
}
