import { Builder, JSX, Font, FontFactory } from 'canvacord';

class Generator extends Builder {
	constructor() {
		// set the size of the image
		super(300, 300);

		// if no fonts are loaded, load the default font
		if (!FontFactory.size) Font.loadDefault();
	}

	async render() {
		// declare the shape of the image
		return JSX.createElement('div', {
			style: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'white',
				width: '100%',
				height: '100%',
			},
		}, JSX.createElement('h1', { '': '' }, {
			children: 'Hello word',
			type: '',
			props: { '': '' },
			key: undefined,
		}));
	}
}

export default class ImageManipulator {
	static async guildIcon(name: string, size = 1024) {
		const str = this.getAcronym(name);
		if (!str) throw new Error('Couldn\'t parse acronym!');
		if (typeof size !== 'number' || size < 0 || size > 4096 || size % 16 !== 0) throw new Error('Invalid icon size!');

		// create an instance of the builder
		const generator = new Generator();
		// build the image and save it to a file
		return await generator.build({ format: 'png' });
	}

	static getAcronym(name: string) {
		return name
			.replace(/'s /g, ' ')
			.replace(/\w+/g, e => e[0])
			.replace(/\s/g, '');
	}
}