const ms = require('ms');

// Get the difference of time in days
module.exports.getDayDiff = (timestamp0, timestamp1) => {
	return Math.round(this.getDurationDiff(timestamp0, timestamp1));
};

// Get the difference between times
module.exports.getDurationDiff = (timestamp0, timestamp1) => {
	return Math.abs(timestamp0 - timestamp1) / (1000 * 60 * 60 * 24);
};

// comvert time format (1m) to ms - for timed commands
module.exports.getTotalTime = (timeFormat, message, language) => {
	// Make sure it ends with the correct time delimiter
	if (!timeFormat.endsWith('d') && !timeFormat.endsWith('h') && !timeFormat.endsWith('m') && !timeFormat.endsWith('s')) {
		message.error(language, 'INCORRECT_DELIMITERS').then(m => m.delete({ timeout:5000 }));
		return false;
	}
	// make sure its a number infront of the time delimiter
	if (isNaN(timeFormat.slice(0, -1))) {
		message.error(language, 'NOT_NUMBER').then(m => m.delete({ timeout:5000 }));
		return false;
	}
	// convert timeFormat to milliseconds
	const time = ms(timeFormat);
	// Make sure time isn't over 10 days
	if (time >= 864000000) {
		message.error(language, 'MAX_TIME').then(m => m.delete({ timeout: 5000 }));
		return false;
	}
	// return time to requested command
	return time;
};

// convert hh:mm:ss to milliseconds
// time = 3:00
// message for error checking
// language of corrent language
module.exports.timestamp = (time) => {
	const p = time.split(':');
	let s = 0, m = 1;

	while (p.length > 0) {
		s = +m * parseInt(p.pop(), 10);
		m = m * 60;
	}
	return s;
};

// convert (XhXm | xhr | xmins) to milliseconds
module.exports.delimiterChange = (time, message, language) => {

};

// Convert time to nanoseconds
module.exports.toNano = (time) => {
	return (time[0] * 1e9 + time[1]) * 1e-6;
};


module.exports.abbrNum = (number, decPlaces) => {
	// 2 decimal places => 100, 3 => 1000, etc
	decPlaces = Math.pow(10, decPlaces);

	// Enumerate number abbreviations
	const abbrev = ['k', 'm', 'b', 't' ];

	// Go through the array backwards, so we do the largest first
	for (let i = abbrev.length - 1; i >= 0; i--) {

		// Convert array index to "1000", "1000000", etc
		const size = Math.pow(10, (i + 1) * 3);

		// If the number is bigger or equal do the abbreviation
		if(size <= number) {
			// Here, we multiply by decPlaces, round, and then divide by decPlaces.
			// This gives us nice rounding to a particular decimal place.
			number = Math.round(number * decPlaces / size) / decPlaces;

			// Handle special case where we round up to the next abbreviation
			if((number == 1000) && (i < abbrev.length - 1)) {
				number = 1;
				i++;
			}

			// Add the letter for the abbreviation
			number += abbrev[i];

			// We are done... stop
			break;
		}
	}

	return number;
};
