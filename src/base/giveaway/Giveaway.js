const Discord = require('discord.js');
const { EventEmitter } = require('events');


/**
 * Represents a Giveaway
 */
class Giveaway extends EventEmitter {
	/**
     * @param {GiveawaysManager} manager The Giveaway Manager
     * @param {GiveawayData} options The giveaway data
     */
	constructor(manager, options) {
		super();
		// The Giveaway manager
		this.manager = manager;

		//* The Discord Client
		this.client = manager.client;

		// The giveaway prize
		this.prize = options.prize;

		// The start date of the giveaway
		this.startAt = options.startAt;

		// The end date of the giveaway
		this.endAt = options.endAt;

		// Whether the giveaway is ended
		this.ended = options.ended;

		// The channel ID of the giveaway
		this.channelID = options.channelID;

		// The message ID of the giveaway
		this.messageID = options.messageID;

		// The guild ID of the giveaway
		this.guildID = options.guildID;

		// The number of winners for this giveaway
		this.winnerCount = options.winnerCount;

		// The mention of the user who hosts this giveaway
		this.hostedBy = options.hostedBy;

		// The giveaway messages
		this.messages = options.messages;

		// The giveaway data
		this.options = options;

		// The message instance of the embed of this giveaway
		this.message = null;
	}

	// The remaining time before the end of the giveaway
	get remainingTime() {
		return this.endAt - Date.now();
	}

	// The total duration of the giveaway
	get giveawayDuration() {
		return this.endAt - this.startAt;
	}

	// The color of the giveaway embed
	get embedColor() {
		return this.options.embedColor || this.manager.options.default.embedColor;
	}

	// The color of the giveaway embed when it's ended
	get embedColorEnd() {
		return this.options.embedColorEnd || this.manager.options.default.embedColorEnd;
	}

	// The reaction on the giveaway message
	get reaction() {
		return this.options.reaction || this.manager.options.default.reaction;
	}

	// Whether the bots are able to win the giveaway
	get botsCanWin() {
		return this.options.botsCanWin || this.manager.options.default.botsCanWin;
	}

	// Members with any of these permissions won't be able to win a giveaway.
	get exemptPermissions() {
		return this.options.exemptPermissions || this.manager.options.default.exemptPermissions;
	}

	// Function to filter members. If true is returned, the member won't be able to win the giveaway.
	async exemptMembers(member) {
		if(this.options.exemptMembers && typeof this.options.exemptMembers === 'function') {
			try {
				const result = await this.options.exemptMembers(member);
				return result;
			} catch(error) {
				console.error(error);
				return false;
			}
		}
		if(this.manager.options.default.exemptMembers && typeof this.manager.options.default.exemptMembers === 'function') {
			return await this.manager.options.default.exemptMembers(member);
		}
		return false;
	}

	// The channel of the giveaway
	get channel() {
		return this.client.channels.cache.get(this.channelID);
	}

	// Gets the content of the giveaway
	get content() {
		const roundTowardsZero = this.remainingTime > 0 ? Math.floor : Math.ceil;
		// Gets days, hours, minutes and seconds
		const days = roundTowardsZero(this.remainingTime / 86400000),
			hours = roundTowardsZero(this.remainingTime / 3600000) % 24,
			minutes = roundTowardsZero(this.remainingTime / 60000) % 60;
		let seconds = roundTowardsZero(this.remainingTime / 1000) % 60;
		// Increment seconds if equal to zero
		if (seconds === 0) seconds++;
		// Whether values are inferior to zero
		const isDay = days > 0,
			isHour = hours > 0,
			isMinute = minutes > 0;
		const dayUnit = days < 2 && (this.messages.units.pluralS || this.messages.units.days.endsWith('s')) ? this.messages.units.days.substr(0, this.messages.units.days.length - 1) : this.messages.units.days,
			hourUnit = hours < 2 && (this.messages.units.pluralS || this.messages.units.hours.endsWith('s')) ? this.messages.units.hours.substr(0, this.messages.units.hours.length - 1) : this.messages.units.hours,
			minuteUnit = minutes < 2 && (this.messages.units.pluralS || this.messages.units.minutes.endsWith('s')) ? this.messages.units.minutes.substr(0, this.messages.units.minutes.length - 1) : this.messages.units.minutes,
			secondUnit = seconds < 2 && (this.messages.units.pluralS || this.messages.units.seconds.endsWith('s')) ? this.messages.units.seconds.substr(0, this.messages.units.seconds.length - 1) : this.messages.units.seconds;
		// Generates a first pattern
		const pattern =
            (!isDay ? '' : `{days} ${dayUnit}, `) +
            (!isHour ? '' : `{hours} ${hourUnit}, `) +
            (!isMinute ? '' : `{minutes} ${minuteUnit}, `) +
            `{seconds} ${secondUnit}`;
		// Format the pattern with the right values
		const content = this.messages.timeRemaining
			.replace('{duration}', pattern)
			.replace('{days}', days.toString())
			.replace('{hours}', hours.toString())
			.replace('{minutes}', minutes.toString())
			.replace('{seconds}', seconds.toString());
		return content;
	}

	// The raw giveaway object for this giveaway
	get data() {
		const baseData = {
			messageID: this.messageID,
			channelID: this.channelID,
			guildID: this.guildID,
			startAt: this.startAt,
			endAt: this.endAt,
			ended: this.ended,
			winnerCount: this.winnerCount,
			prize: this.prize,
			messages: this.messages,
			hostedBy: this.options.hostedBy,
			embedColor: this.options.embedColor,
			embedColorEnd: this.options.embedColorEnd,
			botsCanWin: this.options.botsCanWin,
			exemptPermissions: this.options.exemptPermissions,
			exemptMembers: this.options.exemptMembers,
			reaction: this.options.reaction,
		};
		return baseData;
	}

	// Fetches the giveaway message in its channel
	async fetchMessage() {
		return new Promise(async (resolve, reject) => {
			if(!this.messageID) return;
			let message = null;
			message = await this.channel.messages.fetch(this.messageID).catch((e) => console.log(e));
			if (!message) {
				this.manager.giveaways = this.manager.giveaways.filter((g) => g.messageID !== this.messageID);
				this.manager.deleteGiveaway(this.messageID);
				return reject('Unable to fetch message with ID ' + this.messageID + '.');
			}
			this.message = message;
			resolve(message);
		});
	}

	// Gets the giveaway winner(s)
	async roll(winnerCount) {
		if(!this.message) return [];
		// Pick the winner
		const reactions = this.message.reactions.cache;
		const reaction = reactions.get(this.reaction) || reactions.find(r => r.emoji.name === this.reaction);
		if (!reaction) return new Discord.Collection().array();
		const guild = await this.channel.guild.fetch();
		let users = await reaction.users.cache
			.filter(u => u.bot === this.botsCanWin)
			.filter(u => u.id !== this.message.client.user.id)
			.filter(u => guild.member(u.id));

		for(const u of users.array()) {
			const exemptMember = await this.exemptMembers(guild.member(u.id));
			if(exemptMember) {
				users.delete(u.id);
			}
		}

		users = users.filter(u => !this.exemptPermissions.some(p => guild.member(u.id).hasPermission(p)))
			.random(winnerCount || this.winnerCount)
			.filter(u => u)
			.map(u => guild.member(u));
		return users;
	}

	// Edit the giveaway
	edit(options = {}) {
		return new Promise(async (resolve, reject) => {
			if (this.ended) {
				return reject('Giveaway with message ID ' + this.messageID + ' is already ended.');
			}
			if (!this.channel) {
				return reject('Unable to get the channel of the giveaway with message ID ' + this.messageID + '.');
			}
			await this.fetchMessage().catch((e) => console.log(e));
			if (!this.message) {
				return reject('Unable to fetch message with ID ' + this.messageID + '.');
			}
			// Update data
			if (options.newWinnerCount) this.winnerCount = options.newWinnerCount;
			if (options.newPrize) this.prize = options.newPrize;
			if (options.addTime) this.endAt = this.endAt + options.addTime;
			if (options.setEndTimestamp) this.endAt = options.setEndTimestamp;
			// Call the db method
			this.manager.editGiveaway(this.messageID, this.data);
			resolve(this);
		});
	}

	// Ends the giveaway
	end() {
		return new Promise(async (resolve, reject) => {
			if (this.ended) {
				return reject('Giveaway with message ID ' + this.messageID + ' is already ended');
			}
			if (!this.channel) {
				return reject('Unable to get the channel of the giveaway with message ID ' + this.messageID + '.');
			}
			await this.fetchMessage().catch((e) => console.log(e));
			if (!this.message) {
				return reject('Unable to fetch message with ID ' + this.messageID + '.');
			}
			try {
				const winners = await this.roll();
				this.manager.emit('giveawayEnded', this, winners);
				this.ended = true;
				this.manager.editGiveaway(this.messageID, this.data);
				if (winners.length > 0) {
					const formattedWinners = winners.map(w => `<@${w.id}>`).join(', ');
					const str =
											this.messages.winners.substr(0, 1).toUpperCase() +
											this.messages.winners.substr(1, this.messages.winners.length) +
											': ' +
											formattedWinners;
					const embed = new Discord.MessageEmbed()
						.setAuthor(this.prize)
						.setColor(this.embedColorEnd)
						.setFooter(this.messages.endedAt)
						.setDescription(`${str}\n${this.hostedBy ? this.messages.hostedBy.replace('{user}', this.hostedBy) : ''}`)
						.setTimestamp(new Date(this.endAt).toISOString());
					this.message.edit(this.messages.giveawayEnded, { embed });
					this.message.channel.send(
						this.messages.winMessage
							.replace('{winners}', formattedWinners)
							.replace('{prize}', this.prize),
					);
					resolve(winners);
				} else {
					const embed = new Discord.MessageEmbed()
						.setAuthor(this.prize)
						.setColor(this.embedColorEnd)
						.setFooter(this.messages.endedAt)
						.setDescription(`${this.messages.noWinner}\n${this.hostedBy ? this.messages.hostedBy.replace('{user}', this.hostedBy) : ''}`)
						.setTimestamp(new Date(this.endAt).toISOString());
					this.message.edit(this.messages.giveawayEnded, { embed });
					resolve();
				}
			} catch (e) {
				console.log(e);
			}
		});
	}

	// Reroll the giveaway
	reroll(options) {
		return new Promise(async (resolve, reject) => {
			if (!this.ended) {
				return reject('Giveaway with message ID ' + this.messageID + ' is not ended.');
			}
			if (!this.channel) {
				return reject('Unable to get the channel of the giveaway with message ID ' + this.messageID + '.');
			}
			await this.fetchMessage().catch((e) => console.log(e));
			if (!this.message) {
				return reject('Unable to fetch message with ID ' + this.messageID + '.');
			}
			const winners = this.roll();
			if (winners.length > 0) {
				const formattedWinners = winners.map(w => '<@' + w.id + '>').join(', ');
				this.channel.send(options.messages.congrat.replace('{winners}', formattedWinners));
				resolve(winners);
			} else {
				this.channel.send(options.messages.error);
				resolve(new Array());
			}
		});
	}
}

module.exports = Giveaway;
