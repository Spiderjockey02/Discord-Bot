import { AttachmentBuilder, BaseGuildTextChannel, Collection, APIEmbed, JSONEncodable } from 'discord.js';
import EgglordClient from './Egglord';

export default class WebhookManager {
	embedCollection: Collection<string, [APIEmbed | JSONEncodable<APIEmbed>, AttachmentBuilder?][]>;
	client: EgglordClient;
	constructor(client: EgglordClient) {
		this.embedCollection = new Collection();
		this.client = client;

		// Send all the embeds in 15 second intervals
		setInterval(() => this.sendEmbeds(), 15_000);
	}

	/**
	  * Function for adding embeds to the webhook manager. (Stops API abuse)
	  * @param {string} channelID The key to search up
	  * @param {(Embed | AttachmentBuilder)[]} files The args for variables in the key
	  * @readonly
	*/
	addEmbed(channelID: string, files: [APIEmbed | JSONEncodable<APIEmbed>, AttachmentBuilder?]) {
		const checkExisting = this.embedCollection.get(channelID);

		if (checkExisting) {
			this.embedCollection.set(channelID, [...checkExisting, files]);
		} else {
			this.embedCollection.set(channelID, [files]);
		}
	}

	async sendEmbeds() {
		const channelIds = Array.from(this.embedCollection.keys());

		// loop through each channel ID sending their embeds
		for (const channelId of channelIds) {
			try {
				const channel = this.client.channels.cache.get(channelId) as BaseGuildTextChannel | undefined;
				if (channel == undefined) return;

				const webhooks = await channel.fetchWebhooks();
				let webhook = webhooks.find(wh => wh.name == this.client.user.displayName);

				// create webhook if it doesn't exist
				if (!webhook) {
					webhook = await channel.createWebhook({
						avatar: this.client.user.displayAvatarURL({ extension: 'png', size: 1024 }),
						name: this.client.user.displayName,
						reason: 'Mod logging',
					});
				}

				// send the embeds
				const repeats = Math.ceil(this.embedCollection.get(channelId)?.length ?? 0 / 10);
				for (let j = 0; j < repeats; j++) {
				// Get embeds and files to upload via webhook
					const embeds = this.embedCollection.get(channelId)?.map(f => f[0]).filter(f => f !== undefined);
					const files = this.embedCollection.get(channelId)?.map(f => f[1]).filter(f => f !== undefined);
					if (!embeds || !files) return;

					// send webhook message
					await webhook.send({
						embeds: embeds.slice(j * 10, (j * 10) + 10),
						files: files.slice(j * 10, (j * 10) + 10),
					});
				}
				// delete from collection once sent
				this.embedCollection.delete(channelId);
			} catch (err:any) {
				console.log(err);
				// It was likely they didn't have permission to create/send the webhook
				this.client.logger.error(err.message);
				this.embedCollection.delete(channelId);
			}
		}
	}
}