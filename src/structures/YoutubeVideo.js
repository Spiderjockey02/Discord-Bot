module.exports.parseVideo = (data) => {
	if (!data || !data.videoRenderer) return;
	let title = '';
	try {
		title = data.videoRenderer.title.runs[0].text;
		title = title.replace('\\\\', '\\');
		try {
			title = decodeURIComponent(title);
		} catch (e) {
			// @ts-ignore
		}

		return {
			url: `https://www.youtube.com/watch?v=${data.videoRenderer.videoId}`,
			title,
		};
	} catch (e) {
		return undefined;
	}
};
