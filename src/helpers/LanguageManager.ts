import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { promises as fs } from 'fs';
import { Guild, LocaleString } from 'discord.js';
import config from '../config';

export default class languageManager extends Map<LocaleString, any> {
	constructor() {
		super();
		this.init();
	}

	async walkDirectory(dir: string, namespaces: string[] = [], folderName = '') {
		const files = await fs.readdir(dir);

		const languages = [];
		for (const file of files) {
			const stat = await fs.stat(path.join(dir, file));
			if (stat.isDirectory()) {
				const isLanguage = file.includes('-');
				if (isLanguage) languages.push(file);

				const folder = await this.walkDirectory(path.join(dir, file), namespaces,	isLanguage ? '' : `${file}/`);
				namespaces = folder.namespaces;
			} else {
				namespaces.push(`${folderName}${file.substr(0, file.length - 5)}`);
			}
		}
		return { namespaces: [...new Set(namespaces)], languages };
	}

	async init() {
		const options = {
			jsonIndent: 2,
			loadPath: `${process.cwd()}/src/languages/{{lng}}/{{ns}}.json`,
		};

		const { namespaces, languages } = await this.walkDirectory(`${process.cwd()}/src/languages/`);

		i18next.use(Backend);
		await i18next.init({
			backend: options,
			debug: false,
			fallbackLng: 'en-US',
			initImmediate: false,
			interpolation: { escapeValue: false },
			load: 'all',
			ns: namespaces,
			preload: languages,
		});

		for (const language of languages) {
			this.set(language as LocaleString, i18next.getFixedT(language));
		}
	}

	getLanguages() {
		return this.keys;
	}

	getFallback() {
		return config.fallbackLanguage ?? 'en-US';
	}

	translate(guild: Guild | null, key: string, args?: {[key: string]: string | number}) {
		const languageCode = guild?.settings?.language as LocaleString;
		const language = this.get(languageCode ?? this.getFallback());
		if (!language) return 'Invalid language set in data.';
		return language(key, args) as string;
	}
}
