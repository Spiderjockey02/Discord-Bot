// if option is 2, then just warn member
async function warnMember(bot, message, wReason, settings) {
	const wUser = message.guild.member(message.author);
	try {
		await require('./warning-system').run(bot, message, wUser, wReason, settings);
	} catch (err) {
		bot.logger.error(`${err.message} when trying to warn user`);
		message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 10000 }));
	}
}

// if option is 3, then delete message and warn member
function warnDelete(bot, message, wReason, settings) {
	if (message.deletable) message.delete();
	warnMember(bot, message, wReason, settings);
}

// if option is 1, then just delete message
function deleteMessage(message) {
	if (message.deletable) message.delete();
}

module.exports.run = (bot, message, settings) => {
	// Make sure it's not a bot
	if (settings.ModerationIgnoreBotToggle & message.author.bot) return;
	// Get the words
	const words = message.content.split(' ');
	// get roles
	const roles = message.guild.member(message.author)._roles;
	// Check for Badwords
	if (settings.ModerationBadwords >= 1) {
		const found = words.some(word => settings.ModerationBadwordList.includes(word));
		// add role check
		if (found) {
			console.log('found');
			if (!settings.ModerationBadwordChannel.includes(message.channel.id)) {
				console.log('In a protected channel. punish them');
				if (!settings.ModerationBadwordRole.some(role => roles.includes(role))) {
					// punish user
					console.log('Punish user as they dont have ignore role');
					if (settings.ModerationBadwords == 1) deleteMessage(message);
					if (settings.ModerationBadwords == 2) warnMember(bot, message, 'Bad word usage.', settings);
					if (settings.ModerationBadwords == 3) warnDelete(bot, message, 'Bad word usage.', settings);
				}
			}
			return false;
		}
	}
	// Check for Repeated Text

	// Duplicated text

	// check for server invites
	if (settings.ModerationServerInvites >= 1) {
		const found = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|club)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi.test(message.content);
		if (found) {
			console.log('found');
			if (!settings.ModerationServerInvitesChannel.includes(message.channel.id)) {
				console.log('In a protected channel. punish them');
				if (!settings.ModerationServerInvitesRole.some(role => roles.includes(role))) {
					// punish user
					console.log('Punish user as they dont have ignore role');
					if (settings.ModerationServerInvites == 1) deleteMessage(message);
					if (settings.ModerationServerInvites == 2) warnMember(bot, message, 'Posted an invite.', settings);
					if (settings.ModerationServerInvites == 3) warnDelete(bot, message, 'Posted an invite.', settings);
				}
			}
			return false;
		}
	}

	// check for external links
	if (settings.ModerationExternalLinks >= 1) {
		const expression = /^((?:https?:)?\/\/)?((?:www|m)\.)/g;
		const found = expression.test(message.content.toLowerCase());
		if (found) {
			console.log('found');
			if (!settings.ModerationExternalLinksChannel.includes(message.channel.id)) {
				console.log('In a protected channel. punish them');
				if (!settings.ModerationExternalLinksRole.some(role => roles.includes(role))) {
					// punish user
					console.log('Punish user as they dont have ignore role');
					if (settings.ModerationExternalLinks == 1) deleteMessage(message);
					if (settings.ModerationExternalLinks == 2) warnMember(bot, message, 'External links.', settings);
					if (settings.ModerationExternalLinks == 3) warnDelete(bot, message, 'External links.', settings);
				}
			}
			return false;
		}
	}

	// check for spammed caps
	if (settings.ModerationSpammedCaps >= 1) {
		const caps = message.content.replace(/[^A-Z]/g, '').length;
		const total = (caps / message.content.length) * 100;
		if (total >= settings.ModerationSpammedCapsPercentage && message.content.length >= 10) {
			console.log('found');
			if (!settings.ModerationSpammedCapsChannel.includes(message.channel.id)) {
				console.log('In a protected channel. punish them');
				if (!settings.ModerationSpammedCapsRole.some(role => roles.includes(role))) {
					// punish user
					console.log('Punish user as they dont have ignore role');
					if (settings.ModerationSpammedCaps == 1) deleteMessage(message);
					if (settings.ModerationSpammedCaps == 2) warnMember(bot, message, 'External links.', settings);
					if (settings.ModerationSpammedCaps == 3) warnDelete(bot, message, 'External links.', settings);
				}
			}
			return false;
		}
	}

	// check for excessive emojis
	if (settings.ModerationExcessiveEmojis >= 1) {
		const found = false;
		if (found) {
			console.log(found);
			return false;
			// Mass emoji
		}
	}

	// check for mass spoilers
	if (settings.ModerationMassSpoilers >= 1) {
		const found = false;
		if (found) {
			console.log(found);
			return false;
		}
	}

	// check for mass mentions
	if (settings.ModerationMassMention >= 1) {
		const mentionNumber = ((message.mentions.users) ? message.mentions.users.size : 0) + ((message.mentions.roles) ? message.mentions.roles.size : 0);
		if (mentionNumber >= settings.ModerationMassMentionNumber) {
			console.log('found');
			if (!settings.ModerationMassMentionChannel.includes(message.channel.id)) {
				console.log('In a protected channel. punish them');
				if (!settings.ModerationMassMentionRole.some(role => roles.includes(role))) {
					// punish user
					console.log('Punish user as they dont have ignore role');
					if (settings.ModerationMassMention == 1) deleteMessage(message);
					if (settings.ModerationMassMention == 2) warnMember(bot, message, 'Mass mentions.', settings);
					if (settings.ModerationMassMention == 3) warnDelete(bot, message, 'Mass mentions.', settings);
				}
			}
			return false;
		}
	}

	// check for zalgo
	if (settings.ModerationZalgo >= 1) {
		const found = false;
		if (found) {
			console.log(found);
			return false;
		}
	}
	// keep at very bottom (This is done if user broke no auto-mod rules)
	return true;
};
