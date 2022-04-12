const constants = {
	server: ['createdAt', 'createdTimestamp', 'description', 'id', 'memberCount', 'name', 'nameAcronym', 'ownerId', '.rulesChannelId', 'vanityURLCode'],
	channel: ['createdAt', 'createdTimestamp', 'id', 'name', 'members', 'userLimit', 'rtcRegion'],
	user: ['createdAt', 'createdTimestamp', 'bot', 'defaultAvatarURL', 'discriminator', 'id', 'tag', 'username'],
	member: ['joinedAt', 'joinedTimestamp', 'nickname', 'premiumSince', 'premiumSinceTimestamp'],
};

module.exports = (string, member, channel, guild) => {
	const regex = /{(server|channel|user|member).[a-zA-Z]*}/g,
		chars = string.match(regex);
	let x = 0;

	if (chars.length >= 1) {
		while (x < chars.length) {
			console.log(chars[x]);
			const type = chars[x].split('.')[0].substring(1);
			switch (type) {
				case 'server': {
					const value = chars[x].split('.')[1].substring(0, chars[x].split('.')[1].length - 1);
					// Replace variable with value
					if (constants[type].includes(value)) 	string = string.replace(chars[x], guild[value]);
					break;
				}
				case 'channel': {
					const value = chars[x].split('.')[1].substring(0, chars[x].split('.')[1].length - 1);
					// Replace variable with value
					if (constants[type].includes(value)) string = string.replace(chars[x], channel[value]);
					break;
				}
				case 'user': {
					const value = chars[x].split('.')[1].substring(0, chars[x].split('.')[1].length - 1);
					// Replace variable with value
					if (constants[type].includes(value)) string = string.replace(chars[x], member.user[value]);
					break;
				}
				case 'member': {
					const value = chars[x].split('.')[1].substring(0, chars[x].split('.')[1].length - 1);
					// Replace variable with value
					if (constants[type].includes(value)) string = string.replace(chars[x], member[value]);
					break;
				}
			}
			x++;
		}
		return string;
	} else {
		return string;
	}
};
