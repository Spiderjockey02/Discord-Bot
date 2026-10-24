// Updates the bundled yt-dlp binary, since YouTube changes often break older versions.
// Runs after installing dependencies, and can be run from the bot with `script update-ytdlp`.
const { execFileSync } = require('child_process'),
	fs = require('fs');

function update(stdio = 'inherit') {
	let binary;
	try {
		({ YOUTUBE_DL_PATH: binary } = require('youtube-dl-exec/src/constants'));
	} catch {
		binary = null;
	}
	if (!binary || !fs.existsSync(binary)) return 'yt-dlp binary not found, skipping update.';

	try {
		return String(execFileSync(binary, ['-U'], { stdio }) ?? 'complete').trim();
	} catch (err) {
		// yt-dlp exits with code 1 on some platforms after applying an update
		return err.status === 1 ? 'complete' : 'yt-dlp update skipped (network issue or already up to date).';
	}
}

module.exports.run = async () => update('pipe');

if (require.main === module) console.log(update());
