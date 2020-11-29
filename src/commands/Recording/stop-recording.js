// Dependecies
const fs = require('fs');

module.exports.run = async () => {
	const chunks = fs.readdirSync('./src/assets/soundclips');
	let inputStream;
	let currentfile;
	const outputStream = fs.createWriteStream('./src/assets/soundclips/merge.pcm');

	chunks.sort((a, b) => { return a - b; });

	function appendFiles() {
		if (!chunks.length) {
			outputStream.end(() => console.log('Finished.'));
			return;
		}

		currentfile = './src/assets/soundclips/' + chunks.shift();
		inputStream = fs.createReadStream(currentfile);

		inputStream.pipe(outputStream, { end: false });

		inputStream.on('end', function() {
			console.log(currentfile + ' appended');
			appendFiles();
		});
	}

	appendFiles();
};

module.exports.config = {
	command: 'stop-record',
	aliases: ['stoprecord'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Stop record',
	category: 'Recording',
	description: 'Stops recording voice chat',
	usage: '${PREFIX}stop-record',
};
