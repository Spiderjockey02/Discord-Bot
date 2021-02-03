// Dependencies
const { EventEmitter } = require('events'),
	merge = require('deepmerge'),
	Discord = require('discord.js'),
	{ defaultGiveawayMessages, defaultManagerOptions, defaultRerollOptions } = require('./Constants.js'),
	Giveaway = require('./Giveaway.js'),
	{ giveawayDB } = require('../../modules/database/models');

// Giveaway manager
class GiveawaysManager extends EventEmitter {
	constructor(client, options, init = true) {
		super();
		if (!client) throw new Error('Client is a required option.');
		this.client = client;
		this.ready = false;
		this.giveaways = [];
		this.options = merge(defaultManagerOptions, options);
		if (init) this._init();
	}

	// Generate an embed displayed when a giveaway is running (with the remaining time)
	generateMainEmbed(giveaway) {
		const embed = new Discord.MessageEmbed();
		embed
			.setAuthor(giveaway.prize)
			.setColor(giveaway.embedColor)
			.setFooter(`${giveaway.winnerCount} ${giveaway.messages.winners}`)
			.setDescription(
				giveaway.messages.inviteToParticipate +
                    '\n' +
                    giveaway.remainingTimeText +
                    '\n' +
                    (giveaway.hostedBy ? giveaway.messages.hostedBy.replace('{user}', giveaway.hostedBy) : ''),
			)
			.setTimestamp(new Date(giveaway.endAt).toISOString());
		return embed;
	}

	// Generate an embed displayed when a giveaway is ended (with the winners list)
	generateEndEmbed(giveaway, winners) {
		const formattedWinners = winners.map((w) => `<@${w.id}>`).join(', ');
		const winnersString =
            giveaway.messages.winners.substr(0, 1).toUpperCase() +
            giveaway.messages.winners.substr(1, giveaway.messages.winners.length) +
            ': ' +
            formattedWinners;
		const embed = new Discord.MessageEmbed();
		embed
			.setAuthor(giveaway.prize)
			.setColor(giveaway.embedColorEnd)
			.setFooter(giveaway.messages.endedAt)
			.setDescription(
				winnersString +
                    '\n' +
                    (giveaway.hostedBy ? giveaway.messages.hostedBy.replace('{user}', giveaway.hostedBy) : ''),
			)
			.setTimestamp(new Date(giveaway.endAt).toISOString());
		return embed;
	}

	// Generate an embed displayed when a giveaway is ended and when there is no valid participations
	generateNoValidParticipantsEndEmbed(giveaway) {
		const embed = new Discord.MessageEmbed();
		embed
			.setAuthor(giveaway.prize)
			.setColor(giveaway.embedColorEnd)
			.setFooter(giveaway.messages.endedAt)
			.setDescription(
				giveaway.messages.noWinner +
                    '\n' +
                    (giveaway.hostedBy ? giveaway.messages.hostedBy.replace('{user}', giveaway.hostedBy) : ''),
			)
			.setTimestamp(new Date(giveaway.endAt).toISOString());
		return embed;
	}

	// Ends a giveaway. This method is automatically called when a giveaway ends.
	end(messageID) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveaway) {
				return reject('No giveaway found with ID ' + messageID + '.');
			}
			giveaway.end().then(resolve).catch(reject);
		});
	}

	// Starts a new giveaway
	start(channel, options) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (!this.ready) {
				return reject('The manager is not ready yet.');
			}
			options.messages = options.messages
				? merge(defaultGiveawayMessages, options.messages)
				: defaultGiveawayMessages;
			if (!channel || !channel.id) {
				return reject(`channel is not a valid guildchannel. (val=${channel})`);
			}
			if (!options.time || isNaN(options.time)) {
				return reject(`options.time is not a number. (val=${options.time})`);
			}
			if (!options.prize) {
				return reject(`options.prize is not a string. (val=${options.prize})`);
			}
			if (!options.winnerCount || isNaN(options.winnerCount)) {
				return reject(`options.winnerCount is not a number. (val=${options.winnerCount})`);
			}
			const giveaway = new Giveaway(this, {
				startAt: Date.now(),
				endAt: Date.now() + options.time,
				winnerCount: options.winnerCount,
				winnerIDs: [],
				channelID: channel.id,
				guildID: channel.guild.id,
				ended: false,
				prize: options.prize,
				hostedBy: options.hostedBy ? options.hostedBy.toString() : null,
				messages: options.messages,
				reaction: options.reaction,
				botsCanWin: options.botsCanWin,
				exemptPermissions: options.exemptPermissions,
				exemptMembers: options.exemptMembers,
				embedColor: options.embedColor,
				embedColorEnd: options.embedColorEnd,
				extraData: options.extraData,
			});
			const embed = this.generateMainEmbed(giveaway);
			const message = await channel.send(giveaway.messages.giveaway, { embed });
			message.react(giveaway.reaction);
			giveaway.messageID = message.id;
			this.giveaways.push(giveaway);
			await this.saveGiveaway(giveaway.messageID, giveaway.data);
			resolve(giveaway);
		});
	}

	// Choose new winner(s) for the giveaway
	reroll(messageID, options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			options = merge(defaultRerollOptions, options);
			const giveawayData = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveawayData) {
				return reject('No giveaway found with ID ' + messageID + '.');
			}
			const giveaway = new Giveaway(this, giveawayData);
			giveaway
				.reroll(options)
				.then((winners) => {
					this.emit('giveawayRerolled', giveaway, winners);
					resolve();
				})
				.catch(reject);
		});
	}

	// Edits a giveaway. The modifications will be applicated when the giveaway will be updated.
	edit(messageID, options = {}) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveaway) {
				return reject('No giveaway found with ID ' + messageID + '.');
			}
			giveaway.edit(options).then(resolve).catch(reject);
		});
	}

	// Deletes a giveaway. It will delete the message and all the giveaway data.
	delete(messageID, doNotDeleteMessage) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveaway) {
				return reject('No giveaway found with ID ' + messageID + '.');
			}
			if (!giveaway.channel) {
				return reject('Unable to get the channel of the giveaway with message ID ' + giveaway.messageID + '.');
			}
			if (!doNotDeleteMessage) {
				await giveaway.fetchMessage();
				if (giveaway.message) {
					// Delete the giveaway message
					giveaway.message.delete();
				}
			}
			this.giveaways = this.giveaways.filter((g) => g.messageID !== messageID);
			await this.deleteGiveaway(messageID);
			this.emit('giveawayDeleted', giveaway);
			resolve();
		});
	}

	async deleteGiveaway(messageID) {
		await giveawayDB.findOneAndDelete({ messageID: messageID }).exec();
		return;
	}

	async refreshStorage(client) {
		return client.shard.broadcastEval(() => this.giveawaysManager.getAllGiveaways());
	}

	async getAllGiveaways() {
		return await giveawayDB.find({});
	}

	async editGiveaway(_messageID, _giveawayData) {
		let data = await giveawayDB.findOne({ messageID: _messageID });
		if (typeof data !== 'object') data = {};
		for (const key in _giveawayData) {
			if (_giveawayData.key) {
				if (data[key] !== _giveawayData[key]) data[key] = _giveawayData[key];
				else return;
			}
		}
		await data.updateOne(_giveawayData);
		return;
	}

	async saveGiveaway(messageID, giveawayData) {
		const newGuild = await new giveawayDB(giveawayData);
		await newGuild.save();
		return;
	}

	_checkGiveaway() {
		if (this.giveaways.length <= 0) return;
		this.giveaways.forEach(async (giveaway) => {
			if (giveaway.ended) return;
			if (!giveaway.channel) return;
			if (giveaway.remainingTime <= 0) {
				return this.end(giveaway.messageID);
			}
			await giveaway.fetchMessage();
			if (!giveaway.message) {
				giveaway.ended = true;
				await this.editGiveaway(giveaway.messageID, giveaway.data);
				return;
			}
			const embed = this.generateMainEmbed(giveaway);
			giveaway.message.edit(giveaway.messages.giveaway, { embed });
			if (giveaway.remainingTime < this.options.updateCountdownEvery) {
				setTimeout(() => this.end.call(this, giveaway.messageID), giveaway.remainingTime);
			}
		});
	}

	async _handleRawPacket(packet) {
		if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
		const giveaway = this.giveaways.find((g) => g.messageID === packet.d.message_id);
		if (!giveaway) return;
		if (giveaway.ended && packet.t === 'MESSAGE_REACTION_REMOVE') return;
		const guild = this.client.guilds.cache.get(packet.d.guild_id);
		if (!guild) return;
		if (packet.d.user_id === this.client.user.id) return;
		const member = guild.members.cache.get(packet.d.user_id) || (await guild.members.fetch(packet.d.user_id));
		if (!member) return;
		const channel = guild.channels.cache.get(packet.d.channel_id);
		if (!channel) return;
		const message = channel.messages.cache.get(packet.d.message_id) || (await channel.messages.fetch(packet.d.message_id));
		if (!message) return;
		const reaction = message.reactions.cache.get(giveaway.reaction || this.options.default.reaction);
		if (!reaction) return;
		if (reaction.emoji.name !== packet.d.emoji.name) return;
		if (reaction.emoji.id && reaction.emoji.id !== packet.d.emoji.id) return;
		if (packet.t === 'MESSAGE_REACTION_ADD') {
			if (giveaway.ended) return this.emit('endedGiveawayReactionAdded', giveaway, member, reaction);
			this.emit('giveawayReactionAdded', giveaway, member, reaction);
		} else {
			this.emit('giveawayReactionRemoved', giveaway, member, reaction);
		}
	}

	async _init() {
		const rawGiveaways = await this.getAllGiveaways();
		rawGiveaways.forEach((giveaway) => {
			this.giveaways.push(new Giveaway(this, giveaway));
		});
		setInterval(() => {
			if (this.client.readyAt) this._checkGiveaway.call(this);
		}, this.options.updateCountdownEvery);
		this.ready = true;
		if (
			!isNaN(this.options.endedGiveawaysLifetime) &&
            this.options.endedGiveawaysLifetime
		) {
			this.giveaways
				.filter((g) => g.ended && ((g.endAt + this.options.endedGiveawaysLifetime) <= Date.now()))
				.forEach((giveaway) => this.deleteGiveaway(giveaway.messageID));
		}

		this.client.on('raw', (packet) => this._handleRawPacket(packet));
	}
}

module.exports = GiveawaysManager;
