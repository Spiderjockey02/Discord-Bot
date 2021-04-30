module.exports = async (bot) => {
	// get list of channel ID's
	const channelIDs = Array.from(bot.embedCollection.keys());

	// loop through each channel ID sending their embeds
	for (let i = 0; i < channelIDs.length; i++) {
		try {
			const webhooks = await bot.channels.fetch(channelIDs[i]).then(c => c.fetchWebhooks());
			let webhook = webhooks.find(wh => wh.name == bot.user.username);

			// create webhook if it doesn't exist
			if (!webhook) webhook = await bot.channels.fetch(channelIDs[i]).then(c => c.createWebhook(bot.user.username));

			// send the embeds
			const repeats = Math.ceil(bot.embedCollection.get(channelIDs[i]).length / 10);
			for (let j = 0; j < repeats; j++) {
				// Get the embeds
				const embeds = bot.embedCollection.get(channelIDs[i])?.slice(j * 10, (j * 10) + 10);
				if (!embeds) return;

				await webhook.send('', {
					username: bot.user.name,
					avatarURL: bot.user.displayAvatarURL({ format: 'png', size: 1024 }),
					// make sure only 10 embeds are sent
					embeds: embeds,
				});
			}

			// delete from collection once sent
			bot.embedCollection.delete(channelIDs[i]);
		} catch (err) {
			// It was likely they didn't have permission to create/send the webhook
			bot.logger.error(err.message);
			bot.embedCollection.delete(channelIDs[i]);
		}
	}
};
