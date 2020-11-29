// Dependecies
const fs = require('fs');

const createNewChunk = () => {
	const pathToFile = `./src/assets/soundclips/${Date.now()}.pcm`;
	return fs.createWriteStream(pathToFile);
};

module.exports.run = async (bot, message) => {
	try {
		const voicechannel = message.member.voice.channel;
		if (!voicechannel) return message.channel.send('Please join a voice channel first!');

		voicechannel.join().then(connection => {
			const dispatcher = connection.play('./src/assets/recordings/drop.mp3');
			dispatcher.on('finish', () => { console.log(`Joined ${voicechannel.name}!\n\nREADY TO RECORD\n`); });
			const receiver = connection.receiver;
			connection.on('speaking', (user, speaking) => {
				if (speaking) {
					console.log(`${user.username} started speaking`);
					const audioStream = receiver.createStream(user, { mode: 'pcm' });
					audioStream.on('data', (chunk) => {
						console.log(`Received ${chunk.length} bytes of data.`);
					});
					audioStream.pipe(createNewChunk());
					audioStream.on('end', () => { console.log(`${user.username} stopped speaking`); });
				}
			});
		});
	} catch (e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'start-record',
	aliases: ['record'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Start record',
	category: 'Recording',
	description: 'Starts recording voice chat',
	usage: '${PREFIX}start-record',
};
