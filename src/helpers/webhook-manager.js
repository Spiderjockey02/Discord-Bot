const { Collection } = require('discord.js'),
	embedCollection = new Collection();

module.exports = async (bot, channelID, embed) => {
	// collect embeds
	if (!embedCollection.has(channelID)) {
		embedCollection.set(channelID, embed);
	} else {
		embedCollection.set(channelID, [embedCollection.get(channelID), embed]);
	}

	// send embeds to correct channel
	setInterval(async () => {
		// get list of channel ID's
		const channelIDs = Array.from(embedCollection.keys());

		// loop through each channel ID sending their embeds
		for (let i = 0; i < channelIDs.length; i++) {
			try {
				let webhooks = await bot.channels.cache.get(channelIDs[i]).fetchWebhooks();
				let webhook = webhooks.find(wh => wh.name == bot.user.username);

				// create webhook if it doesn't exist
				if (!webhook) {
					await bot.channels.cache.get(channelIDs[i]).createWebhook(bot.user.username);
					webhooks = await bot.channels.cache.get(channelIDs[i]).fetchWebhooks();
					webhook = webhooks.find(wh => wh.name == bot.user.username);
				}

				// send embed
				webhook.send('', {
					username: bot.user.name,
					avatarURL: bot.user.displayAvatarURL({ format: 'png', size: 1024 }),
					embeds: embedCollection.get(channelIDs[i]),
				});

				// delete from collection once sent
				embedCollection.delete(channelIDs[i]);
			} catch (err) {
				// It was likely they didn't have permission to create/send the webhook
				bot.logger.error(err.message);
				embedCollection.delete(channelIDs[i]);
			}
		}
	}, 10000);
};
