module.exports.run = (bot, message, settings) => {
	// Make sure it's not a bot
	if (message.author.bot) return;
	// check for bad words
	words = message.content.split(' ');

	if (settings.ModerationBadwords >= 1) {

	}

	if (settings.ModerationRepeatedText >= 1) {

	}

	if (settings.ModerationServerInvites >= 1) {

	}

	if (settings.ModerationExternalLinks >= 1) {

	}

	if (settings.ModerationSpammedCaps >= 1) {

	}
	if (settings.ModerationExcessiveEmojis >= 1) {

	}

	if (settings.ModerationMassMention >= 1) {

	}

	if (settings.ModerationMassSpoilers >= 1) {

	}

	if (settings.ModerationZalgo >= 1) {

	}
};
