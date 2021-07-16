// variables
const emojiList = ['⏮', '◀️', '▶️', '⏭'],
	timeout = 120000;

module.exports = async (bot, channel, pages) => {
	let page = 0;
	const curPage = await channel.send({ embeds: [pages[page]] });

	// react to embed with all emojis
	for (const emoji of emojiList) {
		await curPage.react(emoji);
		await bot.delay(750);
	}

	// create reactionCollector to update page in embed
	const filter = (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot;
	const reactionCollector = await curPage.createReactionCollector({ filter, time: timeout });

	// find out what emoji was reacted on to update pages
	reactionCollector.on('collect', (reaction, user) => {
		if (!user.bot && channel.permissionsFor(bot.user).has('MANAGE_MESSAGES')) reaction.users.remove(user.id);
		switch (reaction.emoji.name) {
		case emojiList[0]:
			page = 0;
			break;
		case emojiList[1]:
			page = page > 0 ? --page : 0;
			break;
		case emojiList[2]:
			page = page + 1 < pages.length ? ++page : (pages.length - 1);
			break;
		case emojiList[3]:
			page = pages.length - 1;
			break;
		default:
			break;
		}
		curPage.edit({ embeds: [pages[page]] });
	});

	// when timer runs out remove all reactions to show end of pageinator
	reactionCollector.on('end', () => curPage.reactions.removeAll());
	return curPage;
};
