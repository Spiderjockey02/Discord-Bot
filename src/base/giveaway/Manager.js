const { EventEmitter } = require('node:events'),
	{ setTimeout, setInterval } = require('node:timers'),
	merge = require('deepmerge'),
	{ GiveawaySchema } = require('../../database/models'),
	{ Intents, MessageEmbed, Util } = require('discord.js'),
	Giveaway = require('./Giveaway.js'),
	{ validateEmbedColor } = require('./utils.js');

/**
 * Giveaways Manager
 */
class GiveawaysManager extends EventEmitter {
	/**
     * @param {Discord.Client} client The Discord Client
     * @param {GiveawaysManagerOptions} [options] The manager options
     */
	constructor(client, options) {
		super();
		if (!client?.options) throw new Error(`Client is a required option. (val=${client})`);
		if (!new Intents(client.options.intents).has(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)) {
			throw new Error('Client is missing the "GUILD_MESSAGE_REACTIONS" intent.');
		}

		/**
         * The Discord Client
         * @type {Discord.Client}
         */
		this.client = client;
		/**
         * Whether the manager is ready
         * @type {Boolean}
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

		this._init();
	}

	/**
     * Generate an embed displayed when a giveaway is running (with the remaining time)
     * @param {Giveaway} giveaway The giveaway the embed needs to be generated for
     * @param {boolean} [lastChanceEnabled=false] Whether or not to include the last chance text
     * @returns {Discord.MessageEmbed} The generated embed
     */
	generateMainEmbed(giveaway, lastChanceEnabled = false) {
		const embed = new MessageEmbed()
			.setTitle(giveaway.prize)
			.setColor(
				giveaway.isDrop
					? giveaway.embedColor
					: giveaway.pauseOptions.isPaused && giveaway.pauseOptions.embedColor
						? giveaway.pauseOptions.embedColor
						: lastChanceEnabled
							? giveaway.lastChance.embedColor
							: giveaway.embedColor,
			)
			.setFooter({
				text:
                    typeof giveaway.messages.embedFooter === 'object'
                    	? giveaway.messages.embedFooter.text?.length > 0
                    		? giveaway.messages.embedFooter.text
                    		: ''
                    	: giveaway.messages.embedFooter,
				iconURL: giveaway.messages.embedFooter.iconURL,
			})
			.setDescription(
				giveaway.isDrop
					? giveaway.messages.dropMessage
					: (giveaway.pauseOptions.isPaused
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
			.setThumbnail(giveaway.thumbnail);
		if (giveaway.endAt !== Infinity) embed.setTimestamp(giveaway.endAt);
		else delete embed.timestamp;
		return giveaway.fillInEmbed(embed);
	}

	/**
     * Generate an embed displayed when a giveaway is ended (with the winners list)
     * @param {Giveaway} giveaway The giveaway the embed needs to be generated for
     * @param {Discord.GuildMember[]} winners The giveaway winners
     * @returns {Discord.MessageEmbed} The generated embed
     */
	generateEndEmbed(giveaway, winners) {
		let formattedWinners = winners.map((w) => `${w}`).join(', ');

		const strings = {
			winners: giveaway.fillInString(giveaway.messages.winners),
			hostedBy: giveaway.fillInString(giveaway.messages.hostedBy),
			endedAt: giveaway.fillInString(giveaway.messages.endedAt),
			prize: giveaway.fillInString(giveaway.prize),
		};

		const descriptionString = (formattedWinners) =>
			strings.winners + ' ' + formattedWinners + (giveaway.hostedBy ? '\n' + strings.hostedBy : '');

		for (
			let i = 1;
			descriptionString(formattedWinners).length > 4096 ||
            strings.prize.length + strings.endedAt.length + descriptionString(formattedWinners).length > 6000;
			i++
		) {
			formattedWinners = formattedWinners.slice(0, formattedWinners.lastIndexOf(', <@')) + `, ${i} more`;
		}

		return new MessageEmbed()
			.setTitle(strings.prize)
			.setColor(giveaway.embedColorEnd)
			.setFooter({ text: strings.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
			.setDescription(descriptionString(formattedWinners))
			.setTimestamp(giveaway.endAt)
			.setThumbnail(giveaway.thumbnail);
	}

	/**
     * Generate an embed displayed when a giveaway is ended and when there is no valid participant
     * @param {Giveaway} giveaway The giveaway the embed needs to be generated for
     * @returns {Discord.MessageEmbed} The generated embed
     */
	generateNoValidParticipantsEndEmbed(giveaway) {
		const embed = new MessageEmbed()
			.setTitle(giveaway.prize)
			.setColor(giveaway.embedColorEnd)
			.setFooter({ text: giveaway.messages.endedAt, iconURL: giveaway.messages.embedFooter.iconURL })
			.setDescription(giveaway.messages.noWinner + (giveaway.hostedBy ? '\n' + giveaway.messages.hostedBy : ''))
			.setTimestamp(giveaway.endAt)
			.setThumbnail(giveaway.thumbnail);
		return giveaway.fillInEmbed(embed);
	}

	/**
     * Ends a giveaway. This method is automatically called when a giveaway ends.
     * @param {Discord.Snowflake} messageId The message id of the giveaway
     * @param {string|MessageObject} [noWinnerMessage=null] Sent in the channel if there is no valid winner for the giveaway.
     * @returns {Promise<Discord.GuildMember[]>} The winners
     */
	async end(messageId, noWinnerMessage = null) {
		const giveaway = this.giveaways.find((g) => g.messageId === messageId);
		if (!giveaway) throw `No giveaway found with message ID: ${messageId}.`;

		const winners = await giveaway.end(noWinnerMessage);
		this.emit('giveawayEnded', giveaway, winners);
	}

	/**
     * Starts a new giveaway
     * @param {Discord.TextChannel|Discord.NewsChannel|Discord.ThreadChannel} channel The channel in which the giveaway will be created
     * @param {GiveawayStartOptions} options The options for the giveaway
     * @returns {Promise<Giveaway>} The created giveaway.
     *
     */
	start(channel, options) {
		return new Promise(async (resolve, reject) => {
			if (!this.ready) return reject('The manager is not ready yet.');
			if (!channel?.id || !channel.isText()) {
				return reject(`channel is not a valid text based channel. (val=${channel})`);
			}
			if (channel.isThread() && !channel.sendable) {
				return reject(
					`The manager is unable to send messages in the provided ThreadChannel. (id=${channel.id})`,
				);
			}
			if (typeof options.prize !== 'string' || (options.prize = options.prize.trim()).length > 256) {
				return reject(`options.prize is not a string or longer than 256 characters. (val=${options.prize})`);
			}
			if (!Number.isInteger(options.winnerCount) || options.winnerCount < 1) {
				return reject(`options.winnerCount is not a positive integer. (val=${options.winnerCount})`);
			}
			if (options.isDrop && typeof options.isDrop !== 'boolean') {
				return reject(`options.isDrop is not a boolean. (val=${options.isDrop})`);
			}
			if (!options.isDrop && (!Number.isFinite(options.duration) || options.duration < 1)) {
				return reject(`options.duration is not a positive number. (val=${options.duration})`);
			}

			const giveaway = new Giveaway(this, {
				startAt: Date.now(),
				endAt: Date.now() + options.duration,
				winnerCount: options.winnerCount,
				channelId: channel.id,
				guildId: channel.guildId,
				prize: options.prize,
				hostedBy: options.hostedBy,
				messages:
                    options.messages && typeof options.messages === 'object'
                    	? merge(GiveawayMessages, options.messages)
                    	: GiveawayMessages,
				reaction: Util.resolvePartialEmoji(options.reaction) ? options.reaction : undefined,
				embedColor: validateEmbedColor(options.embedColor) ? options.embedColor : undefined,
				embedColorEnd: validateEmbedColor(options.embedColorEnd) ? options.embedColorEnd : undefined,
				lastChance: options.lastChance,
				pauseOptions: options.pauseOptions,
				allowedMentions:  options.allowedMentions,
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
	async reroll(messageId, options = {}) {
		const giveaway = this.giveaways.find((g) => g.messageId === messageId);
		if (!giveaway) throw new Error(`No giveaway found with message ID: ${messageId}.`);

		// Get new winners and emit event
		const winners = await giveaway.reroll(options);
		this.emit('giveawayRerolled', giveaway, winners);
	}

	/**
    * Pauses a giveaway.
    * @param {Discord.Snowflake} messageId The message Id of the giveaway to pause.
    * @param {PauseOptions} [options=giveaway.pauseOptions] The pause options.
    * @returns {Promise<Giveaway>} The paused giveaway.
  */
	async pause(messageId, options = {}) {
		const giveaway = this.giveaways.find((g) => g.messageId === messageId);
		if (!giveaway) throw new Error(`No giveaway found with message ID: ${messageId}.`);

		await giveaway.pause(options);
	}

	/**
    * Unpauses a giveaway.
    * @param {Discord.Snowflake} messageId The message Id of the giveaway to unpause.
    * @returns {Promise<Giveaway>} The unpaused giveaway.
  */
	async unpause(messageId) {
		const giveaway = this.giveaways.find((g) => g.messageId === messageId);
		if (!giveaway) throw new Error(`No giveaway found with message ID: ${messageId}.`);

		await giveaway.unpause();
	}

	/**
    * Edits a giveaway. The modifications will be applicated when the giveaway will be updated.
    * @param {Discord.Snowflake} messageId The message Id of the giveaway to edit
    * @param {GiveawayEditOptions} [options={}] The edit options
    * @returns {Promise<Giveaway>} The edited giveaway
  */
	async edit(messageId, options = {}) {
		const giveaway = this.giveaways.find((g) => g.messageId === messageId);
		if (!giveaway) throw new Error(`No giveaway found with message ID: ${messageId}.`);

		await giveaway.edit(options);
	}

	/**
    * Deletes a giveaway. It will delete the message and all the giveaway data.
    * @param {Discord.Snowflake} messageId  The message Id of the giveaway
    * @param {boolean} [doNotDeleteMessage=false] Whether the giveaway message shouldn't be deleted
    * @returns {Promise<Giveaway>}
  */
	async delete(messageId, doNotDeleteMessage = false) {
		const giveaway = this.giveaways.find((g) => g.messageId === messageId);
		if (!giveaway) throw new Error(`No giveaway found with message ID: ${messageId}.`);

		if (!doNotDeleteMessage) {
			giveaway.message ??= await giveaway.fetchMessage().catch(() => null);
			giveaway.message?.delete();
		}
		this.giveaways = this.giveaways.filter((g) => g.messageId !== messageId);
		await this.deleteGiveaway(messageId);
		this.emit('giveawayDeleted', giveaway);
	}

	/**
    * Delete a giveaway from the database
    * @param {Discord.Snowflake} messageId The message Id of the giveaway to delete
    * @returns {Promise<boolean>}
  */
	async deleteGiveaway(messageId) {
		return GiveawaySchema.findOneAndDelete({ messageID: messageId }).exec();
	}

	/**
    * Refresh the cache to support shards.
    * @ignore
  */
	async refreshStorage() {
		return this.client.shard.broadcastEval(() => this.giveawaysManager.getAllGiveaways());
	}

	/**
    * Gets the giveaways from the storage file, or create it
    * @ignore
    * @returns {Promise<GiveawayData[]>}
  */
	async getAllGiveaways() {
		return GiveawaySchema.find({});
	}

	/**
    * Edit the giveaway in the database
    * @ignore
    * @param {Discord.Snowflake} messageId The message Id identifying the giveaway
    * @param {GiveawayData} giveawayData The giveaway data to save
  */
	async editGiveaway(messageId, giveawayData) {
		let data = await GiveawaySchema.findOne({ messageID: messageId });
		if (typeof data !== 'object') data = {};
		for (const key in giveawayData) {
			if (giveawayData.key) {
				if (data[key] !== giveawayData[key]) data[key] = giveawayData[key];
				else return;
			}
		}
		return data.updateOne(giveawayData);
	}

	/**
    * Save the giveaway in the database
    * @ignore
    * @param {Discord.Snowflake} messageId The message Id identifying the giveaway
    * @param {GiveawayData} giveawayData The giveaway data to save
  */
	async saveGiveaway(messageId, giveawayData) {
		const newGuild = new GiveawaySchema(giveawayData);
		return newGuild.save();
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
				if (giveaway.endAt + this.options.endedGiveawaysLifetime <= Date.now()) {
					this.giveaways = this.giveaways.filter((g) => g.messageId !== giveaway.messageId);
					await this.deleteGiveaway(giveaway.messageId);
				}
				return;
			}

			// Second case: the giveaway is paused and we should check whether it should be unpaused
			if (giveaway.pauseOptions.isPaused) {
				if (
					!Number.isFinite(giveaway.pauseOptions.unPauseAfter) &&
                    !Number.isFinite(giveaway.pauseOptions.durationAfterPause)
				) {
					giveaway.options.pauseOptions.durationAfterPause = giveaway.remainingTime;
					giveaway.endAt = Infinity;
					await this.editGiveaway(giveaway.messageId, giveaway.data);
				}
				if (
					Number.isFinite(giveaway.pauseOptions.unPauseAfter) &&
                    Date.now() < giveaway.pauseOptions.unPauseAfter
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
			if (
				giveaway.lastChance.enabled &&
                giveaway.remainingTime - giveaway.lastChance.threshold < this.options.forceUpdateEvery
			) {
				setTimeout(async () => {
					giveaway.message ??= await giveaway.fetchMessage().catch(() => null);
					const embed = this.generateMainEmbed(giveaway, true);
					giveaway.message = await giveaway.message
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
			if (!giveaway.message.embeds[0]) {
				giveaway.message = await giveaway.message.suppressEmbeds(false).catch(() => null);
			}

			// Regular case: the giveaway is not ended and we need to update it
			const lastChanceEnabled =
                giveaway.lastChance.enabled && giveaway.remainingTime < giveaway.lastChance.threshold;
			const updatedEmbed = this.generateMainEmbed(giveaway, lastChanceEnabled);
			const needUpdate =
                !updatedEmbed.equals(giveaway.message.embeds[0]) ||
                giveaway.message.content !== giveaway.fillInString(giveaway.messages.giveaway);

			if (needUpdate || this.options.forceUpdateEvery) {
				giveaway.message = await giveaway.message
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
		const giveaway = this.giveaways.find((g) => g.messageId === packet.d.message_id);
		if (!giveaway) return;
		if (giveaway.ended && packet.t === 'MESSAGE_REACTION_REMOVE') return;
		const guild =
            this.client.guilds.cache.get(packet.d.guild_id) ||
            (await this.client.guilds.fetch(packet.d.guild_id).catch(() => null));
		if (!guild || !guild.available) return;
		if (packet.d.user_id === this.client.user.id) return;
		const member = await guild.members.fetch(packet.d.user_id).catch(() => null);
		if (!member) return;
		const channel = await this.client.channels.fetch(packet.d.channel_id).catch(() => null);
		if (!channel) return;
		const message = await channel.messages.fetch(packet.d.message_id).catch(() => null);
		if (!message) return;
		const emoji = Util.resolvePartialEmoji(giveaway.reaction);
		const reaction = message.reactions.cache.find((r) =>
			[r.emoji.name, r.emoji.id].filter(Boolean).includes(emoji?.id ?? emoji?.name),
		);
		if (!reaction) return;
		if (reaction.emoji.name !== packet.d.emoji.name) return;
		if (reaction.emoji.id && reaction.emoji.id !== packet.d.emoji.id) return;
		if (packet.t === 'MESSAGE_REACTION_ADD') {
			if (giveaway.ended) return this.emit('endedGiveawayReactionAdded', giveaway, member, reaction);
			this.emit('giveawayReactionAdded', giveaway, member, reaction);
			if (giveaway.isDrop && reaction.count - 1 >= giveaway.winnerCount) {
				this.end(giveaway.messageId).catch(() => null);
			}
		} else {this.emit('giveawayReactionRemoved', giveaway, member, reaction);}
	}

	/**
    * Inits the manager
    * @ignore
  */
	async _init() {
		const rawGiveaways = await this.getAllGiveaways();
		rawGiveaways.forEach((giveaway) => this.giveaways.push(new Giveaway(this, giveaway)));
		setInterval(() => {
			if (this.client.readyAt) this._checkGiveaway.call(this);
		}, this.options.forceUpdateEvery);
		this.ready = true;

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
