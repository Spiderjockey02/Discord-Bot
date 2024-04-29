const constants = {
	server: ['createdAt', 'createdTimestamp', 'description', 'id', 'memberCount', 'name', 'nameAcronym', 'ownerId', '.rulesChannelId', 'vanityURLCode'],
	channel: ['createdAt', 'createdTimestamp', 'id', 'name', 'members', 'userLimit', 'rtcRegion'],
	user: ['createdAt', 'createdTimestamp', 'bot', 'defaultAvatarURL', 'discriminator', 'id', 'displayName', 'username'],
	member: ['joinedAt', 'joinedTimestamp', 'nickname', 'premiumSince', 'premiumSinceTimestamp'],
};

module.exports = (string, member, channel, guild) => {
	const regex = /{(server|channel|user|member)(.[a-zA-Z]*)?}/g,
		chars = string.match(regex);
	let x = 0;

	if (chars?.length >= 1) {
		while (x < chars.length) {
			// Uses positive look ahead to extract the type from the variable (e.g {user} & {user.mention}  == 'user')
			const type = chars[x].match(/(?<=\{)(server|channel|user|member)(?=\}|.)/g);
			switch (type[0]) {
				case 'server': {
					const type2 = chars[x].replace(`{${type[0]}`, '');
					const value = type2.substring(1, type2.length - 1);
					// Replace variable with value
					if (constants[type].includes(value)) string = string.replace(chars[x], guild[value]);
					break;
				}
				case 'channel': {
					const type2 = chars[x].replace(`{${type[0]}`, '');
					const value = type2.substring(1, type2.length - 1);
					// Replace variable with value
					if (constants[type].includes(value)) string = string.replace(chars[x], channel[value]);
					break;
				}
				case 'user': {
					const type2 = chars[x].replace(`{${type[0]}`, '');
					const value = type2.substring(1, type2.length - 1);
					if (value.length == 1) {
						string = string.replace(chars[x], `<@${member.id}>`);
					} else if (constants[type].includes(value)) {
						string = string.replace(chars[x], member.user[value]);
					}
					break;
				}
				case 'member': {
					const type2 = chars[x].replace(`{${type[0]}`, '');
					const value = type2.substring(1, type2.length - 1);
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
