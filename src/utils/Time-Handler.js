const ms = require('ms');
module.exports.toHHMMSS = (secs) => {
	const sec_num = parseInt(secs, 10);
	const hours = Math.floor(sec_num / 3600);
	const minutes = Math.floor(sec_num / 60) % 60;
	const seconds = sec_num % 60;

	return [hours, minutes, seconds]
		.map(v => v < 10 ? '0' + v : v)
		.filter((v, i) => v !== '00' || i > 0)
		.join(':');
};
module.exports.getDayDiff = (timestamp0, timestamp1) => {
	return Math.round(this.getDurationDiff(timestamp0, timestamp1));
};
module.exports.getDurationDiff = (timestamp0, timestamp1) => {
	return Math.abs(timestamp0 - timestamp1) / (1000 * 60 * 60 * 24);
};

module.exports.getTotalTime = (timeFormat, message, emojis) => {
	// Make sure it ends with the correct time delimiter
	if (!timeFormat.endsWith('d') && !timeFormat.endsWith('h') && !timeFormat.endsWith('m') && !timeFormat.endsWith('s')) {
		message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use one of the following time delimiters: \`d\`,  \`h\`,  \`m\`, \`s\`.` } }).then(m => m.delete({ timeout: 5000 }));
		return false;
	}
	// make sure its a number infront of the time delimiter
	if (isNaN(timeFormat.slice(0, -1))) {
		message.channel.send({ embed:{ color:15158332, description:'Must be a number.' } }).then(m => m.delete({ timeout: 5000 }));
		return false;
	}
	// convert timeFormat to milliseconds
	const time = ms(timeFormat);
	// Make sure time isn't over 10 days
	if (time >= 864000000) {
		message.channel.send({ embed:{ color:15158332, description:'Can\'t be longer than 10 days.' } }).then(m => m.delete({ timeout: 5000 }));
		return false;
	}
	// return time to requested command
	return time;
};

module.exports.toNano = (time) => {
	return (time[0] * 1e9 + time[1]) * 1e-6;
};
