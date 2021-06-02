module.exports.read24hrFormat = (text) => {
	// set values to 0
	let j, k, ms;
	j = k = ms = 0;

	if (!text) return ms = 0;
	const result = text.split(/:/);

	// if time is xx:xx:xx instead of xx:xx
	if (result.length === 3) result.push('00');

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
};

module.exports.getReadableTime = (ms) => {
	if (!ms || ms && !isFinite(ms)) {throw new TypeError('You need to pass a total number of milliseconds! (That number cannot be greater than Number limits)');}
	if (typeof ms !== 'number') {throw new TypeError(`You need to pass a number! Instead received: ${typeof ms}`);}
	const t = this.getTimeObject(ms);
	const reply = [];
	if (t.years) 	reply.push(`${t.years} yrs`);
	if (t.months) reply.push(`${t.months} mo`);
	if (t.days) reply.push(`${t.days} d`);
	if (t.hours) reply.push(`${t.hours} hrs`);
	if (t.minutes) reply.push(`${t.minutes} min`);
	if (t.seconds) reply.push(`${t.seconds} sec`);
	return reply.length > 0 ? reply.join(', ') : '0sec';
};

module.exports.getTimeObject = (ms) => {
	if (!ms || typeof ms !== 'number' || !isFinite(ms)) {throw new TypeError('Final value is greater than Number can hold or you provided invalid argument.');}
	const result = {
		years: 0,
		months: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		milliseconds: Math.floor(ms),
	};
		// Calculate time in rough way
	while (result.milliseconds >= 1000) {
		if (result.milliseconds >= 3.154e+10) {
			result.years++;
			result.milliseconds -= 3.154e+10;
		}
		if (result.milliseconds >= 2.592e+9) {
			result.months++;
			result.milliseconds -= 2.592e+9;
		}
		if (result.milliseconds >= 8.64e+7) {
			result.days++;
			result.milliseconds -= 8.64e+7;
		}
		if (result.milliseconds >= 3.6e+6) {
			result.hours++;
			result.milliseconds -= 3.6e+6;
		}
		if (result.milliseconds >= 60000) {
			result.minutes++;
			result.milliseconds -= 60000;
		}
		if (result.milliseconds >= 1000) {
			result.seconds++;
			result.milliseconds -= 1000;
		}
	}
	// Make it smooth, aka sort
	if (result.seconds >= 60) {
		result.minutes += Math.floor(result.seconds / 60);
		result.seconds = result.seconds - (Math.floor(result.seconds / 60) * 60);
	}
	if (result.minutes >= 60) {
		result.hours += Math.floor(result.minutes / 60);
		result.minutes = result.minutes - (Math.floor(result.minutes / 60) * 60);
	}
	if (result.hours >= 24) {
		result.days += Math.floor(result.hours / 24);
		result.hours = result.hours - (Math.floor(result.hours / 24) * 24);
	}
	if (result.days >= 30) {
		result.months += Math.floor(result.days / 30);
		result.days = result.days - (Math.floor(result.days / 30) * 30);
	}
	if (result.months >= 12) {
		result.years += Math.floor(result.months / 12);
		result.months = result.months - (Math.floor(result.months / 12) * 12);
	}
	return result;
};


// comvert time format (1m) to ms - for timed commands
module.exports.getTotalTime = (timeFormat, message) => {
	// Make sure it ends with the correct time delimiter
	if (!timeFormat.endsWith('d') && !timeFormat.endsWith('h') && !timeFormat.endsWith('m') && !timeFormat.endsWith('s')) {
		message.channel.error('time:INCORRECT_DELIMITERS').then(m => m.delete({ timeout:5000 }));
		return false;
	}
	// make sure its a number infront of the time delimiter
	if (isNaN(timeFormat.slice(0, -1))) {
		message.channel.error('time:INVALID_TIME').then(m => m.delete({ timeout:5000 }));
		return false;
	}
	// convert timeFormat to milliseconds
	const time = require('ms')(timeFormat);
	// Make sure time isn't over 10 days
	if (time >= 864000000) {
		message.channel.error('time:MAX_TIME').then(m => m.delete({ timeout: 5000 }));
		return false;
	}
	// return time to requested command
	return time;
};
