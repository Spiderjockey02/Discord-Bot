module.exports = class CustomMS {
	read24hrFormat(text) {
		let j = 0;
		let k = 0;
		let ms = 0;
		if (!text) return ms = 0;
		const result = text.split(/:/);
		if (!result) {
			throw new TypeError(`Can't convert: "${text}" into milliseconds.`);
		} else if (result.length > 3) {
			throw new TypeError(`Can't convert: "${text}" because it's too long. Max format: 00:00:00."`);
		}
		if (result.length === 3) {
			result.push('00');
		}
		for (let i = result.length - 1; i >= 0; i--) {
			k = Math.abs(parseInt(result[i]) * 1000 * Math.pow(60, j < 3 ? j : 2));
			j++;
			ms += k;
		}
		if (isFinite(ms)) {
			return ms;
		} else {
			throw new TypeError('Final value is greater than Number can hold.');
		}
	}
};
