// variables
const emojiList = ['⏮', '◀️', '▶️', '⏭'],
	timeout = 120000;

module.exports = async (bot, msg, pages) => {
	let page = 0;
	const curPage = await msg.channel.send(pages[page]);

	// react to embed with all emojis
	for (const emoji of emojiList) await curPage.react(emoji);

	// create reactionCollector to update page in embed
	const filter = (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot;
	const reactionCollector = await curPage.createReactionCollector(filter, { time: timeout });

	// find out what emoji was reacted on to update pages
	reactionCollector.on('collect', (reaction, user) => {
		if (!user.bot && msg.channel.permissionsFor(bot.user).has('MANAGE_MESSAGES')) reaction.users.remove(user.id);
		switch (reaction.emoji.name) {
		case emojiList[0]:
			page = 0;
			break;
		case emojiList[1]:
			page = page > 0 ? --page : 0;
			break;
		case emojiList[2]:
			page = page + 1 < pages.length ? ++page : pages.length;
			break;
		case emojiList[3]:
			page = pages.length - 1;
			break;
		default:
			break;
		}
		curPage.edit(pages[page]);
	});

	// when timer runs out remove all reactions to show end of pageinator
	reactionCollector.on('end', () => curPage.reactions.removeAll());
	return curPage;
};
