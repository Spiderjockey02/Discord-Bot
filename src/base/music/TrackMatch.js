const NOISE_RE =
	/official|lyric|audio|visuali[sz]er|video|\bhd\b|\bhq\b|\b4k\b|remaster|explicit|clean|\bmv\b|\bm\/v\b|\bfull\b|\bsingle\b|\bdeluxe\b/i;
const FEAT_RE = /^(feat\.?|ft\.?|featuring|with|prod\.?|produced by)\s/i;

function fold(s) {
	return String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function clean(s) {
	return s
		.replace(/&/g, ' and ')
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizeTitle(raw) {
	let s = fold(raw);
	s = s.replace(/[([{]([^)\]}]*)[)\]}]/g, (_, inner) =>
		FEAT_RE.test(inner.trim()) || NOISE_RE.test(inner) ? ' ' : ` ${inner} `,
	);
	s = s.replace(/\s[-–—]\s([^-–—]*)$/, (whole, tail) => (NOISE_RE.test(tail) ? '' : whole));
	s = s.replace(/\s(feat\.?|ft\.?|featuring)\s.*$/, '');
	return clean(s);
}

function normalizeArtist(raw) {
	return clean(
		fold(raw)
			.replace(/\s-\stopic$/, '')
			.replace(/vevo$/, '')
			.replace(/\bofficial\b/g, ''),
	);
}

function splitArtists(raw) {
	return fold(raw)
		.split(/,|&|\band\b|\bx\b|\bfeat\.?|\bft\.?|\bfeaturing\b|\bwith\b|\//)
		.map(normalizeArtist)
		.filter(Boolean);
}

function sameArtist(a, b) {
	const na = normalizeArtist(a);
	const nb = normalizeArtist(b);
	if (!na || !nb) return false;
	if (na === nb || na.includes(nb) || nb.includes(na)) return true;
	const sb = splitArtists(b);
	return splitArtists(a).some(x => sb.includes(x));
}

function isExactTrackMatch(source, candidate) {
	const title = normalizeTitle(source.title);
	if (!title || title !== normalizeTitle(candidate.title)) return false;
	return !source.author || sameArtist(source.author, candidate.author);
}

function isExactQueryMatch(query, candidate) {
	const queryWords = clean(fold(query)).split(' ').filter(Boolean);
	const titleWords = normalizeTitle(candidate.title).split(' ').filter(Boolean);
	if (titleWords.length === 0) return false;

	const remaining = [...queryWords];
	for (const word of titleWords) {
		const index = remaining.indexOf(word);
		if (index === -1) return false;
		remaining.splice(index, 1);
	}

	const artistWords = new Set(normalizeArtist(candidate.author).split(' '));
	return remaining.every(word => artistWords.has(word));
}

module.exports = { normalizeTitle, isExactTrackMatch, isExactQueryMatch };
