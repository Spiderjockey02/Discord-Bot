const { EventEmitter } = require('node:events');
const { setTimeout, setInterval } = require('node:timers');
const { GiveawaySchema } = require('../database/models');
const { EmbedBuilder, resolvePartialEmoji, ShardClientUtil, Embed } = require('discord.js');
const DEFAULT_CHECK_INTERVAL = 15000;
const Giveaway = require('../structures/Giveaway.js');

/**
 * Giveaways Manager
 */
class GiveawaysManager extends EventEmitter {
	/**
     * @param {Discord.Client} client The Discord Client
     * @param {GiveawaysManagerOptions} [options] The manager options
     * @param {boolean} [init=true] If the manager should start automatically. If set to "false", for example to create a delay, the manager can be started manually with "manager._init()".
     */
	constructor(client, options, init = true) {
		super();
		if (!client?.options) throw new Error(`Client is a required option. (val=${client})`);

		/**
       * The Discord Client
       * @type {Discord.Client}
       */
		this.client = client;

		/**
	     * Whether the manager is ready
	     * @type {boolean}
	     */
		this.ready = false;

		/**
       * The giveaways managed by this manager
       * @type {Giveaway[]}
       */
		this.giveaways = [];

		/**
       * The manager options
       * @type {GiveawaysManagerOptions}
       */
		this.options = options;

		if (init) this._init();
	}

	/**
     * Generate an embed displayed when a giveaway is running (with the remaining time)
     * @param {Giveaway} giveaway The giveaway the embed needs to be generated for
     * @param {boolean} [lastChanceEnabled=false] Whether or not to include the last chance text
     * @returns {Discord.EmbedBuilder} The generated embed
     */
	generateMainEmbed(giveaway, lastChanceEnabled = false) {
		const embed = new EmbedBuilder()
			.setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaway.prize)
			.setColor(giveaway.pauseOptions.isPaused && giveaway.pauseOptions.embedColor
				? giveaway.pauseOptions.embedColor
				: lastChanceEnabled
					? giveaway.lastChance.embedColor
					: giveaway.embedColor,
			)
			.setFooter({
				text:
                    giveaway.messages.embedFooter.text ??
                    (typeof giveaway.messages.embedFooter === 'string' ? giveaway.messages.embedFooter : ''),
				iconURL: giveaway.messages.embedFooter.iconURL,
			})
			.setDescription(
				(giveaway.pauseOptions.isPaused
					? giveaway.pauseOptions.content + '\n\n'
					: lastChanceEnabled
						? giveaway.lastChance.content + '\n\n'
						: '') +
									giveaway.messages.inviteToParticipate +
									'\n' +
									giveaway.messages.drawing.replace(
										'{timestamp}',
										giveaway.endAt === Infinity
											? giveaway.pauseOptions.infiniteDurationText
											: `<t:${Math.round(giveaway.endAt / 1000)}:R>`,
									) +
									(giveaway.hostedBy ? '\n' + giveaway.messages.hostedBy : ''),
			)
			.setThumbnail(giveaway.thumbnail)
			.setImage(giveaway.image);
		if (giveaway.endAt !== Infinity) embed.setTimestamp(giveaway.endAt);
		return giveaway.fillInEmbed(embed);
	}

	/**
     * Generate an embed displayed when a giveaway is ended (with the winners list)
     * @param {Giveaway} giveaway The giveaway the embed needs to be generated for
     * @param {Discord.GuildMember[]} winners The giveaway winners
     * @returns {Discord.EmbedBuilder} The generated embed
     */
	generateEndEmbed(giveaway, winners) {
		let formattedWinners = winners.map((w) => `${w}`).join(', ');

		const strings = {
			winners: giveaway.fillInString(giveaway.messages.winners),
			hostedBy: giveaway.fillInString(giveaway.messages.hostedBy),
			endedAt: giveaway.fillInString(giveaway.messages.endedAt),
			title: giveaway.fillInString(giveaway.messages.title) ?? giveaway.fillInString(giveaway.prize),
		};

		const descriptionString = (fWinners) => strings.winners + ' ' + fWinners + (giveaway.hostedBy ? '\n' + strings.hostedBy : '');

		for (let i = 1; descriptionString(formattedWinners).length > 4096 || strings.title.length + strings.endedAt.length + descriptionString(formattedWinners).length > 6000; i++) {
			formattedWinners = formattedWinners.slice(0, formattedWinners.lastIndexOf(', <@')) + `, ${i} more`;
		}
		console.log(giveaway);

		return new EmbedBuilder()
			.setTitle(strings.title)
			.setColor(giveaway.embedColorEnd)
			.setFooter({ text: strings.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
			.setDescription(descriptionString(formattedWinners))
			.setTimestamp(giveaway.endAt)
			.setThumbnail(giveaway.thumbnail)
			.setImage(giveaway.image);
	}

	/**
     * Generate an embed displayed when a giveaway is ended and when there is no valid participant
     * @param {Giveaway} giveaway The giveaway the embed needs to be generated for
     * @returns {Discord.EmbedBuilder} The generated embed
     */
	generateNoValidParticipantsEndEmbed(giveaway) {
		const embed = new EmbedBuilder()
			.setTitle(typeof giveaway.messages.title === 'string' ? giveaway.messages.title : giveaway.prize)
			.setColor(giveaway.embedColorEnd)
			.setFooter({ text: giveaway.messages.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
			.setDescription(giveaway.messages.noWinner + (giveaway.hostedBy ? '\n' + giveaway.messages.hostedBy : ''))
			.setTimestamp(giveaway.endAt)
			.setThumbnail(giveaway.thumbnail)
			.setImage(giveaway.image);
		return giveaway.fillInEmbed(embed);
	}

	/**
     * Ends a giveaway. This method is automatically called when a giveaway ends.
     * @param {Discord.Snowflake} messageId The message id of the giveaway
     * @param {?string|MessageObject} [noWinnerMessage=null] Sent in the channel if there is no valid winner for the giveaway.
     * @returns {Promise<Discord.GuildMember[]>} The winners
     */
	end(messageId, noWinnerMessage = null) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageId === messageId);
			if (!giveaway) return reject('No giveaway found with message Id ' + messageId + '.');

			giveaway
				.end(noWinnerMessage)
				.then((winners) => {
					this.emit('giveawayEnded', giveaway, winners);
					resolve(winners);
				})
				.catch(reject);
		});
	}

	/**
     * Starts a new giveaway
     * @param {Discord.GuildTextBasedChannel} channel The channel in which the giveaway will be created
     * @param {GiveawayStartOptions} options The options for the giveaway
     * @returns {Promise<Giveaway>} The created giveaway.
     *
    */
	start(channel, options) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (!this.ready) return reject('The manager is not ready yet.');
			if (!channel?.id || !channel.isTextBased()) {
				return reject(`channel is not a valid text based channel. (val=${channel})`);
			}
			if (channel.isThread() && !channel.sendable) {
				return reject(
					`The manager is unable to send messages in the provided ThreadChannel. (id=${channel.id})`,
				);
			}
			const giveaway = new Giveaway(this, {
				startAt: Date.now(),
				endAt: Date.now() + options.duration,
				winnerCount: options.winnerCount,
				channelId: channel.id,
				guildId: channel.guildId,
				prize: options.prize,
				hostedBy: options.hostedBy ? options.hostedBy.toString() : undefined,
				messages: options.messages,
				thumbnail: typeof options.thumbnail === 'string' ? options.thumbnail : undefined,
				image: typeof options.image === 'string' ? options.image : undefined,
				reaction: resolvePartialEmoji(options.reaction) ? options.reaction : undefined,
				embedColor: this.options.default.embedColor,
				embedColorEnd: this.options.default.embedColor,
				extraData: options.extraData,
				lastChance: this.options.default.lastChance,
				pauseOptions: this.options.default.pauseOptions,
				allowedMentions: options.allowedMentions && typeof options.allowedMentions === 'object'
					? options.allowedMentions
					: undefined,
			});

			const embed = this.generateMainEmbed(giveaway);
			const message = await channel.send({
				content: giveaway.fillInString(giveaway.messages.giveaway),
				embeds: [embed],
				allowedMentions: giveaway.allowedMentions,
			});
			giveaway.messageId = message.id;
			const reaction = await message.react(giveaway.reaction);
			giveaway.message = reaction.message;
			this.giveaways.push(giveaway);
			await this.saveGiveaway(giveaway.messageId, giveaway.data);
			resolve(giveaway);
		});
	}

	/**
     * Choose new winner(s) for the giveaway
     * @param {Discord.Snowflake} messageId The message Id of the giveaway to reroll
     * @param {GiveawayRerollOptions} [options] The reroll options
     * @returns {Promise<Discord.GuildMember[]>} The new winners
     */
	reroll(messageId, options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageId === messageId);
			if (!giveaway) return reject('No giveaway found with message Id ' + messageId + '.');

			giveaway
				.reroll(options)
				.then((winners) => {
					this.emit('giveawayRerolled', giveaway, winners);
					resolve(winners);
				})
				.catch(reject);
		});
	}

	/**
     * Pauses a giveaway.
     * @param {Discord.Snowflake} messageId The message Id of the giveaway to pause.
     * @param {PauseOptions} [options=giveaway.pauseOptions] The pause options.
     * @returns {Promise<Giveaway>} The paused giveaway.
     */
	pause(messageId, options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageId === messageId);
			if (!giveaway) return reject('No giveaway found with message Id ' + messageId + '.');
			giveaway.pause(options).then(resolve).catch(reject);
		});
	}

	/**
     * Unpauses a giveaway.
     * @param {Discord.Snowflake} messageId The message Id of the giveaway to unpause.
     * @returns {Promise<Giveaway>} The unpaused giveaway.
     */
	unpause(messageId) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageId === messageId);
			if (!giveaway) return reject('No giveaway found with message Id ' + messageId + '.');
			giveaway.unpause().then(resolve).catch(reject);
		});
	}

	/**
     * Edits a giveaway. The modifications will be applicated when the giveaway will be updated.
     * @param {Discord.Snowflake} messageId The message Id of the giveaway to edit
     * @param {GiveawayEditOptions} [options={}] The edit options
     * @returns {Promise<Giveaway>} The edited giveaway
     */
	edit(messageId, options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageId === messageId);
			if (!giveaway) return reject('No giveaway found with message Id ' + messageId + '.');
			giveaway.edit(options).then(resolve).catch(reject);
		});
	}

	/**
     * Deletes a giveaway. It will delete the message and all the giveaway data.
     * @param {Discord.Snowflake} messageId  The message Id of the giveaway
     * @param {boolean} [doNotDeleteMessage=false] Whether the giveaway message shouldn't be deleted
     * @returns {Promise<Giveaway>}
     */
	delete(messageId, doNotDeleteMessage = false) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageId === messageId);
			if (!giveaway) return reject('No giveaway found with message Id ' + messageId + '.');

			if (!doNotDeleteMessage) {
				giveaway.message ??= await giveaway.fetchMessage().catch(() => null);
				giveaway.message?.delete();
			}
			this.giveaways = this.giveaways.filter((g) => g.messageId !== messageId);
			await this.deleteGiveaway(messageId);
			this.emit('giveawayDeleted', giveaway);
			resolve(giveaway);
		});
	}

	/**
     * Delete a giveaway from the database
     * @param {Discord.Snowflake} messageId The message Id of the giveaway to delete
     * @returns {Promise<boolean>}
     */
	async deleteGiveaway(messageId) {
		// Find by messageId and delete it
		await GiveawaySchema.deleteOne({ messageId }).exec();
		// Don't forget to return something!
		return true;
	}

	/**
     * Gets the giveaways from the storage file, or create it
     * @ignore
     * @returns {Promise<GiveawayData[]>}
     */
	async getAllGiveaways() {
		// Get all giveaways from the database. We fetch all documents by passing an empty condition.
		return await GiveawaySchema.find().lean().exec();
	}

	/**
     * Edit the giveaway in the database
     * @ignore
     * @param {Discord.Snowflake} messageId The message Id identifying the giveaway
     * @param {GiveawayData} giveawayData The giveaway data to save
     */
	async editGiveaway(messageId, giveawayData) {
		// Find by messageId and update it
		try {
			await GiveawaySchema.updateOne({ messageId }, giveawayData).exec();
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	/**
     * Save the giveaway in the database
     * @ignore
     * @param {Discord.Snowflake} messageId The message Id identifying the giveaway
     * @param {GiveawayData} giveawayData The giveaway data to save
     */
	async saveGiveaway(messageId, giveawayData) {
		try {
			// Add the new giveaway to the database
			await GiveawaySchema.create(giveawayData);
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	/**
     * Checks each giveaway and update it if needed
     * @ignore
     */
	_checkGiveaway() {
		if (this.giveaways.length <= 0) return;
		this.giveaways.forEach(async (giveaway) => {
			// First case: giveaway is ended and we need to check if it should be deleted
			if (giveaway.ended) {
				if (
					Number.isFinite(this.options.endedGiveawaysLifetime) &&
                    giveaway.endAt + this.options.endedGiveawaysLifetime <= Date.now()
				) {
					this.giveaways = this.giveaways.filter((g) => g.messageId !== giveaway.messageId);
					await this.deleteGiveaway(giveaway.messageId);
				}
				return;
			}

			// Third case: the giveaway is paused and we should check whether it should be unpaused
			if (giveaway.pauseOptions.isPaused) {
				if (
					!Number.isFinite(giveaway.pauseOptions.unpauseAfter) &&
                    !Number.isFinite(giveaway.pauseOptions.durationAfterPause)
				) {
					giveaway.options.pauseOptions.durationAfterPause = giveaway.remainingTime;
					giveaway.endAt = Infinity;
					await this.editGiveaway(giveaway.messageId, giveaway.data);
				}
				if (
					Number.isFinite(giveaway.pauseOptions.unpauseAfter) &&
                    Date.now() > giveaway.pauseOptions.unpauseAfter
				) {
					return this.unpause(giveaway.messageId).catch(() => null);
				}
			}

			// Fourth case: giveaway should be ended right now. this case should only happen after a restart
			// Because otherwise, the giveaway would have been ended already (using the next case)
			if (giveaway.remainingTime <= 0) return this.end(giveaway.messageId).catch(() => null);

			// Fifth case: the giveaway will be ended soon, we add a timeout so it ends at the right time
			// And it does not need to wait for _checkGiveaway to be called again
			giveaway.ensureEndTimeout();

			// Sixth case: the giveaway will be in the last chance state soon, we add a timeout so it's updated at the right time
			// And it does not need to wait for _checkGiveaway to be called again
			if (giveaway.lastChance.enabled && giveaway.remainingTime - giveaway.lastChance.threshold < DEFAULT_CHECK_INTERVAL) {
				setTimeout(async () => {
					giveaway.message ??= await giveaway.fetchMessage().catch(() => null);
					const embed = this.generateMainEmbed(giveaway, true);
					await giveaway.message
						?.edit({
							content: giveaway.fillInString(giveaway.messages.giveaway),
							embeds: [embed],
							allowedMentions: giveaway.allowedMentions,
						})
						.catch(() => null);
				}, giveaway.remainingTime - giveaway.lastChance.threshold);
			}

			// Fetch the message if necessary and make sure the embed is alright
			giveaway.message ??= await giveaway.fetchMessage().catch(() => null);
			if (!giveaway.message) return;
			if (!giveaway.message.embeds[0]) await giveaway.message.suppressEmbeds(false).catch(() => null);

			// Regular case: the giveaway is not ended and we need to update it
			const lastChanceEnabled = giveaway.lastChance.enabled && giveaway.remainingTime < giveaway.lastChance.threshold;
			const updatedEmbed = this.generateMainEmbed(giveaway, lastChanceEnabled);
			const needUpdate = new Embed(giveaway.message.embeds[0].data).equals(new Embed(updatedEmbed.data))
									|| giveaway.message.content !== giveaway.fillInString(giveaway.messages.giveaway);

			if (needUpdate || this.options.forceUpdateEvery) {
				await giveaway.message
					.edit({
						content: giveaway.fillInString(giveaway.messages.giveaway),
						embeds: [updatedEmbed],
						allowedMentions: giveaway.allowedMentions,
					})
					.catch(() => null);
			}
		});
	}

	/**
     * @ignore
     * @param {any} packet
     */
	async _handleRawPacket(packet) {
		if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
		if (packet.d.user_id === this.client.user.id) return;

		const giveaway = this.giveaways.find((g) => g.messageId === packet.d.message_id);
		if (!giveaway || (giveaway.ended && packet.t === 'MESSAGE_REACTION_REMOVE')) return;

		const guild =
            this.client.guilds.cache.get(packet.d.guild_id) ||
            (await this.client.guilds.fetch(packet.d.guild_id).catch(() => null));
		if (!guild || !guild.available) return;

		const member = await guild.members.fetch(packet.d.user_id).catch(() => null);
		if (!member) return;

		const channel = await this.client.channels.fetch(packet.d.channel_id).catch(() => null);
		if (!channel) return;

		const message = await channel.messages.fetch(packet.d.message_id).catch(() => null);
		if (!message) return;

		const emoji = resolvePartialEmoji(giveaway.reaction);
		const reaction = message.reactions.cache.find((r) =>
			[r.emoji.name, r.emoji.id].filter(Boolean).includes(emoji?.id ?? emoji?.name),
		);
		if (!reaction || reaction.emoji.name !== packet.d.emoji.name) return;
		if (reaction.emoji.id && reaction.emoji.id !== packet.d.emoji.id) return;

		if (packet.t === 'MESSAGE_REACTION_ADD') {
			if (giveaway.ended) return this.emit('endedGiveawayReactionAdded', giveaway, member, reaction);
			this.emit('giveawayReactionAdded', giveaway, member, reaction);
		} else {
			this.emit('giveawayReactionRemoved', giveaway, member, reaction);
		}
	}

	/**
     * Inits the manager
     * @ignore
     */
	async _init() {
		let rawGiveaways = await this.getAllGiveaways();

		await (this.client.readyAt ? Promise.resolve() : new Promise((resolve) => this.client.once('ready', resolve)));

		// Filter giveaways for each shard
		if (this.client.shard && this.client.guilds.cache.size) {
			const shardId = ShardClientUtil.shardIdForGuildId(
				this.client.guilds.cache.first().id,
				this.client.shard.count,
			);
			rawGiveaways = rawGiveaways.filter(
				(g) => shardId === ShardClientUtil.shardIdForGuildId(g.guildId, this.client.shard.count),
			);
		}

		rawGiveaways.forEach((giveaway) => this.giveaways.push(new Giveaway(this, giveaway)));

		setInterval(() => {
			if (this.client.readyAt) this._checkGiveaway.call(this);
		}, this.options.forceUpdateEvery);
		this.ready = true;

		// Delete data of ended giveaways
		if (Number.isFinite(this.options.endedGiveawaysLifetime)) {
			const endedGiveaways = this.giveaways.filter(
				(g) => g.ended && g.endAt + this.options.endedGiveawaysLifetime <= Date.now(),
			);
			this.giveaways = this.giveaways.filter(
				(g) => !endedGiveaways.map((giveaway) => giveaway.messageId).includes(g.messageId),
			);
			for (const giveaway of endedGiveaways) await this.deleteGiveaway(giveaway.messageId);
		}

		this.client.on('raw', (packet) => this._handleRawPacket(packet));
	}
}

module.exports = GiveawaysManager;
