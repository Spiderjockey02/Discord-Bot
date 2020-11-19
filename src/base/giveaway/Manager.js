const { EventEmitter } = require('events');
const merge = require('deepmerge');
const { writeFile, readFile, exists } = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(writeFile);
const existsAsync = promisify(exists);
const readFileAsync = promisify(readFile);
const Discord = require('discord.js');
const { defaultGiveawayMessages, defaultManagerOptions, defaultRerollOptions } = require('./Constants.js');
const Giveaway = require('./Giveaway.js');

/**
 * Giveaways Manager
 */
class GiveawaysManager extends EventEmitter {
	/**
     * @param {Discord.Client} client The Discord Client
     * @param {GiveawaysManagerOptions} options The manager options
     */
	constructor(client, options) {
		super();
		if (!client) throw new Error('Client is a required option.');

		//* The Discord Client
		this.client = client;

		// Whether the manager is ready
		this.ready = false;

		// The giveaways managed by this manager
		this.giveaways = [];

		// The manager options
		this.options = merge(defaultManagerOptions, options);

		this._init();

		this.client.on('raw', async (packet) => {
			if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
			const giveaway = this.giveaways.find((g) => g.messageID === packet.d.message_id);
			if (!giveaway) return;
			if (giveaway.ended) return;
			const guild = this.client.guilds.cache.get(packet.d.guild_id);
			if (!guild) return;
			const member = guild.members.cache.get(packet.d.user_id) || await guild.members.fetch(packet.d.user_id).catch((e) => console.log(e));
			if (!member) return;
			const channel = guild.channels.cache.get(packet.d.channel_id);
			if (!channel) return;
			const message = channel.messages.cache.get(packet.d.message_id) || await channel.messages.fetch(packet.d.message_id);
			if (!message) return;
			const reaction = message.reactions.cache.get(giveaway.reaction || this.options.default.reaction);
			if (!reaction) return;
			if(reaction.emoji.name !== packet.d.emoji.name) return;
			if(reaction.emoji.id && reaction.emoji.id !== packet.d.emoji.id) return;
			if (packet.t === 'MESSAGE_REACTION_ADD') {
				this.emit('giveawayReactionAdded', giveaway, member, reaction);
			} else {
				this.emit('giveawayReactionRemoved', giveaway, member, reaction);
			}
		});
	}

	// Ends a giveaway. This method is automatically called when a giveaway ends.
	end(messageID) {
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
		return new Promise(async (resolve, reject) => {
			if (!this.ready) {
				return reject('The manager is not ready yet.');
			}
			if (!options.messages) {
				options.messages = defaultGiveawayMessages;
			}
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
			});
			const embed = new Discord.MessageEmbed()
				.setAuthor(giveaway.prize)
				.setColor(giveaway.embedColor)
				.setFooter(`${giveaway.winnerCount} ${giveaway.messages.winners}`)
				.setDescription(
					`${options.messages.inviteToParticipate}\n${giveaway.content}\n${
						giveaway.hostedBy ? giveaway.messages.hostedBy.replace('{user}', giveaway.hostedBy) : ''
					}`,
				)
				.setTimestamp(new Date(giveaway.endAt).toISOString());
			const message = await channel.send(options.messages.giveaway, { embed });
			message.react(giveaway.reaction);
			giveaway.messageID = message.id;
			this.giveaways.push(giveaway);
			await this.saveGiveaway(giveaway.messageID, giveaway.data);
			resolve(giveaway);
		});
	}

	// Choose new winner(s) for the giveaway
	reroll(messageID, options = {}) {
		return new Promise(async (resolve, reject) => {
			options = merge(defaultRerollOptions, options);
			const giveawayData = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveawayData) {
				return reject('No giveaway found with ID ' + messageID + '.');
			}
			const giveaway = new Giveaway(this, giveawayData);
			giveaway.reroll(options).then((winners) => {
				this.emit('giveawayRerolled', giveaway, winners);
				resolve();
			}).catch(reject);
		});
	}

	// Edits a giveaway. The modifications will be applicated when the giveaway will be updated.
	edit(messageID, options = {}) {
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
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveaway) {
				return reject('No giveaway found with ID ' + messageID + '.');
			}
			if (!giveaway.channel) {
				return reject('Unable to get the channel of the giveaway with message ID ' + giveaway.messageID + '.');
			}
			if (!doNotDeleteMessage) {
				await giveaway.fetchMessage().catch((e) => console.log(e));
				if (giveaway.message) {
					// Delete the giveaway message
					giveaway.message.delete();
				}
			}
			this.giveaways = this.giveaways.filter((g) => g.messageID !== messageID);
			await this.deleteGiveaway(messageID);
			resolve();
		});
	}

	// Delete a giveaway from the database
	async deleteGiveaway(messageID) {
		await writeFileAsync(
			this.options.storage,
			JSON.stringify(this.giveaways.map((giveaway) => giveaway.data)),
			'utf-8',
		);
		this.refreshStorage();
		return;
	}

	// Refresh the cache to support shards.
	async refreshStorage() {
		return true;
	}

	// Gets the giveaways from the storage file, or create it
	async getAllGiveaways() {
		// Whether the storage file exists, or not
		const storageExists = await existsAsync(this.options.storage);
		// If it doesn't exists
		if (!storageExists) {
			// Create the file with an empty array
			await writeFileAsync(this.options.storage, '[]', 'utf-8');
			return [];
		} else {
			// If the file exists, read it
			const storageContent = await readFileAsync(this.options.storage);
			try {
				const giveaways = await JSON.parse(storageContent.toString());
				if (Array.isArray(giveaways)) {
					return giveaways;
				} else {
					console.log(storageContent, giveaways);
					throw new SyntaxError('The storage file is not properly formatted (giveaways is not an array).');
				}
			} catch (e) {
				if (e.message === 'Unexpected end of JSON input') {
					throw new SyntaxError('The storage file is not properly formatted (Unexpected end of JSON input).');
				} else {
					throw e;
				}
			}
		}
	}

	// Edit the giveaway in the database
	async editGiveaway(messageID, giveawayData) {
		await writeFileAsync(
			this.options.storage,
			JSON.stringify(this.giveaways.map((giveaway) => giveaway.data)),
			'utf-8',
		);
		this.refreshStorage();
		return;
	}

	// Save the giveaway in the database
	async saveGiveaway(messageID, giveawayData) {
		await writeFileAsync(
			this.options.storage,
			JSON.stringify(this.giveaways.map((giveaway) => giveaway.data)),
			'utf-8',
		);
		this.refreshStorage();
		return;
	}

	// Checks each giveaway and update it if needed
	_checkGiveaway() {
		if (this.giveaways.length <= 0) return;
		this.giveaways.forEach(async (giveaway) => {
			if (giveaway.ended) return;
			if (!giveaway.channel) return;
			if (giveaway.remainingTime <= 0) {
				return this.end(giveaway.messageID).catch((e) => console.log(e));
			}
			await giveaway.fetchMessage().catch((e) => console.log(e));
			if (!giveaway.message) {
				giveaway.ended = true;
				await this.editGiveaway(giveaway.messageID, giveaway.data);
				return;
			}
			const embed = new Discord.MessageEmbed()
				.setAuthor(giveaway.prize)
				.setColor(giveaway.embedColor)
				.setFooter(`${giveaway.winnerCount} ${giveaway.messages.winners}`)
				.setDescription(
					`${giveaway.messages.inviteToParticipate}\n${giveaway.content}\n${
						giveaway.hostedBy ? giveaway.messages.hostedBy.replace('{user}', giveaway.hostedBy) : ''
					}`,
				)
				.setTimestamp(new Date(giveaway.endAt).toISOString());
			giveaway.message.edit(giveaway.messages.giveaway, { embed });
			if (giveaway.remainingTime < this.options.updateCountdownEvery) {
				setTimeout(() => this.end.call(this, giveaway.messageID), giveaway.remainingTime);
			}
		});
	}

	// Inits the manager
	async _init() {
		const rawGiveaways = await this.getAllGiveaways();
		rawGiveaways.forEach((giveaway) => {
			this.giveaways.push(new Giveaway(this, giveaway));
		});
		setInterval(() => {
			if (this.client.readyAt) this._checkGiveaway.call(this);
		}, this.options.updateCountdownEvery);
		this.ready = true;
	}
}

module.exports = GiveawaysManager;
