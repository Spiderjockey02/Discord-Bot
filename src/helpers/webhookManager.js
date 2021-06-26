module.exports = async (bot) => {
	// get list of channel ID's
	const channelIDs = Array.from(bot.embedCollection.keys());

	// loop through each channel ID sending their embeds
	for (const channel of channelIDs) {
		try {
			const webhooks = await bot.channels.fetch(channel).then(c => c.fetchWebhooks());
			let webhook = webhooks.find(wh => wh.name == bot.user.username);

			// create webhook if it doesn't exist
			if (!webhook) {
				webhook = await bot.channels.fetch(channel).then(c => c.createWebhook(bot.user.username, {
					avatar: bot.user.displayAvatarURL({ format: 'png', size: 1024 }),
				}));
			}

			// send the embeds
			const repeats = Math.ceil(bot.embedCollection.get(channel).length / 10);
			for (let j = 0; j < repeats; j++) {
				// Get embeds and files to upload via webhook
				const embeds = bot.embedCollection.get(channel)?.slice(j * 10, (j * 10) + 10).map(f => f[0]);
				const files = bot.embedCollection.get(channel)?.slice(j * 10, (j * 10) + 10).map(f => f[1]).filter(e => e != undefined);
				if (!embeds) return;

				// send webhook message
				await webhook.send({
					embeds: embeds,
					files: files,
				});
			}
			// delete from collection once sent
			bot.embedCollection.delete(channel);
		} catch (err) {
			// It was likely they didn't have permission to create/send the webhook
			bot.logger.error(err.message);
			bot.embedCollection.delete(channel);
		}
	}
};
