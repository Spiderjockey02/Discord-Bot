'use strict';
const __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
	function adopt(value) { return value instanceof P ? value : new P(function(resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		function rejected(value) { try { step(generator['throw'](value)); } catch (e) { reject(e); } }
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
const __generator = (this && this.__generator) || function(thisArg, body) {
	let _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	return g = { next: verb(0), 'throw': verb(1), 'return': verb(2) }, typeof Symbol === 'function' && (g[Symbol.iterator] = function() { return this; }), g;
	function verb(n) { return function(v) { return step([n, v]); }; }
	function step(op) {
		if (f) throw new TypeError('Generator is already executing.');
		while (_) {
			try {
				if (f = 1, y && (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
				if (y = 0, t) op = [op[0] & 2, t.value];
				switch (op[0]) {
				case 0: case 1: t = op; break;
				case 4: _.label++; return { value: op[1], done: false };
				case 5: _.label++; y = op[1]; op = [0]; continue;
				case 7: op = _.ops.pop(); _.trys.pop(); continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
					if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
					if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
					if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
					if (t[2]) _.ops.pop();
					_.trys.pop(); continue;
				}
				op = body.call(thisArg, _);
			} catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
		}
		if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	}
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.clearGuild = exports.loadChannel = exports.loadCategory = exports.fetchTextChannelData = exports.fetchVoiceChannelData = exports.fetchChannelPermissions = void 0;
/**
 * Gets the permissions for a channel
 */
function fetchChannelPermissions(channel) {
	const permissions = [];
	channel.permissionOverwrites
		.filter(function(p) { return p.type === 'role'; })
		.forEach(function(perm) {
			// For each overwrites permission
			const role = channel.guild.roles.cache.get(perm.id);
			if (role) {
				permissions.push({
					roleName: role.name,
					allow: perm.allow.bitfield,
					deny: perm.deny.bitfield,
				});
			}
		});
	return permissions;
}
exports.fetchChannelPermissions = fetchChannelPermissions;
/**
 * Fetches the voice channel data that is necessary for the backup
 */
function fetchVoiceChannelData(channel) {
	return __awaiter(this, void 0, void 0, function() {
		const _this = this;
		return __generator(this, function(_a) {
			return [2 /* return*/, new Promise(function(resolve) {
				return __awaiter(_this, void 0, void 0, function() {
					let channelData;
					return __generator(this, function(_a) {
						channelData = {
							type: 'voice',
							name: channel.name,
							bitrate: channel.bitrate,
							userLimit: channel.userLimit,
							parent: channel.parent ? channel.parent.name : null,
							permissions: fetchChannelPermissions(channel),
						};
						/* Return channel data */
						resolve(channelData);
						return [2 /* return*/];
					});
				});
			})];
		});
	});
}
exports.fetchVoiceChannelData = fetchVoiceChannelData;
/**
 * Fetches the text channel data that is necessary for the backup
 */
function fetchTextChannelData(channel, options) {
	return __awaiter(this, void 0, void 0, function() {
		const _this = this;
		return __generator(this, function(_a) {
			return [2 /* return*/, new Promise(function(resolve) {
				return __awaiter(_this, void 0, void 0, function() {
					let channelData, messageCount, fetchOptions, lastMessageId, fetchComplete, fetched, _a;
					return __generator(this, function(_b) {
						switch (_b.label) {
						case 0:
							channelData = {
								type: 'text',
								name: channel.name,
								nsfw: channel.nsfw,
								rateLimitPerUser: channel.type === 'text' ? channel.rateLimitPerUser : undefined,
								parent: channel.parent ? channel.parent.name : null,
								topic: channel.topic,
								permissions: fetchChannelPermissions(channel),
								messages: [],
								isNews: channel.type === 'news',
							};
							messageCount = isNaN(options.maxMessagesPerChannel) ? 10 : options.maxMessagesPerChannel;
							fetchOptions = { limit: 100 };
							fetchComplete = false;
							_b.label = 1;
						case 1:
							_b.trys.push([1, 5, , 6]);
							_b.label = 2;
						case 2:
							if (fetchComplete) return [3 /* break*/, 4];
							if (lastMessageId) {
								fetchOptions.before = lastMessageId;
							}
							return [4 /* yield*/, channel.messages.fetch(fetchOptions)];
						case 3:
							fetched = _b.sent();
							if (fetched.size === 0) {
								return [3 /* break*/, 4];
							}
							lastMessageId = fetched.last().id;
							fetched.forEach(function(msg) {
								if (!msg.author || channelData.messages.length >= messageCount) {
									fetchComplete = true;
									return;
								}
								channelData.messages.push({
									username: msg.author.username,
									avatar: msg.author.displayAvatarURL(),
									content: msg.cleanContent,
									embeds: msg.embeds,
									files: msg.attachments.map(function(a) {
										return {
											name: a.name,
											attachment: a.url,
										};
									}),
									pinned: msg.pinned,
								});
							});
							return [3 /* break*/, 2];
						case 4:
						/* Return channel data */
							resolve(channelData);
							return [3 /* break*/, 6];
						case 5:
							_a = _b.sent();
							resolve(channelData);
							return [3 /* break*/, 6];
						case 6: return [2 /* return*/];
						}
					});
				});
			})];
		});
	});
}
exports.fetchTextChannelData = fetchTextChannelData;
/**
 * Creates a category for the guild
 */
function loadCategory(categoryData, guild) {
	return __awaiter(this, void 0, void 0, function() {
		const _this = this;
		return __generator(this, function(_a) {
			return [2 /* return*/, new Promise(function(resolve) {
				guild.channels.create(categoryData.name, { type: 'category' }).then(function(category) {
					return __awaiter(_this, void 0, void 0, function() {
						let finalPermissions;
						return __generator(this, function(_a) {
							switch (_a.label) {
							case 0:
								finalPermissions = [];
								categoryData.permissions.forEach(function(perm) {
									const role = guild.roles.cache.find(function(r) { return r.name === perm.roleName; });
									if (role) {
										finalPermissions.push({
											id: role.id,
											allow: perm.allow,
											deny: perm.deny,
										});
									}
								});
								return [4 /* yield*/, category.overwritePermissions(finalPermissions)];
							case 1:
								_a.sent();
								resolve(category); // Return the category
								return [2 /* return*/];
							}
						});
					});
				});
			})];
		});
	});
}
exports.loadCategory = loadCategory;
/**
 * Create a channel and returns it
 */
function loadChannel(channelData, guild, category, options) {
	return __awaiter(this, void 0, void 0, function() {
		const _this = this;
		return __generator(this, function(_a) {
			return [2 /* return*/, new Promise(function(resolve) {
				return __awaiter(_this, void 0, void 0, function() {
					let createOptions, maxBitrate, bitrate;
					const _this = this;
					return __generator(this, function(_a) {
						createOptions = {
							type: null,
							parent: category,
						};
						if (channelData.type === 'text') {
							createOptions.topic = channelData.topic;
							createOptions.nsfw = channelData.nsfw;
							createOptions.rateLimitPerUser = channelData.rateLimitPerUser;
							createOptions.type = channelData.isNews && guild.features.includes('NEWS') ? 'news' : 'text';
						} else if (channelData.type === 'voice') {
							maxBitrate = [64000, 128000, 256000, 384000];
							bitrate = channelData.bitrate;
							while (bitrate > maxBitrate[guild.premiumTier]) {
								bitrate = maxBitrate[maxBitrate.indexOf(guild.premiumTier) - 1];
							}
							createOptions.bitrate = bitrate;
							createOptions.userLimit = channelData.userLimit;
							createOptions.type = 'voice';
						}
						guild.channels.create(channelData.name, createOptions).then(function(channel) {
							return __awaiter(_this, void 0, void 0, function() {
								let finalPermissions;
								const _this = this;
								return __generator(this, function(_a) {
									switch (_a.label) {
									case 0:
										finalPermissions = [];
										channelData.permissions.forEach(function(perm) {
											const role = guild.roles.cache.find(function(r) { return r.name === perm.roleName; });
											if (role) {
												finalPermissions.push({
													id: role.id,
													allow: perm.allow,
													deny: perm.deny,
												});
											}
										});
										return [4 /* yield*/, channel.overwritePermissions(finalPermissions)];
									case 1:
										_a.sent();
										/* Load messages */
										if (channelData.type === 'text' && channelData.messages.length > 0) {
											channel
												.createWebhook('MessagesBackup', {
													avatar: channel.client.user.displayAvatarURL(),
												})
												.then(function(webhook) {
													return __awaiter(_this, void 0, void 0, function() {
														let messages, _i, messages_1, msg, sentMsg;
														return __generator(this, function(_a) {
															switch (_a.label) {
															case 0:
																messages = channelData.messages
																	.filter(function(m) { return m.content.length > 0 || m.embeds.length > 0 || m.files.length > 0; })
																	.reverse();
																messages = messages.slice(messages.length - options.maxMessagesPerChannel);
																_i = 0, messages_1 = messages;
																_a.label = 1;
															case 1:
																if (!(_i < messages_1.length)) return [3 /* break*/, 5];
																msg = messages_1[_i];
																return [4 /* yield*/, webhook
																	.send(msg.content, {
																		username: msg.username,
																		avatarURL: msg.avatar,
																		embeds: msg.embeds,
																		files: msg.files,
																	})
																	.catch(function(err) {
																		console.log(err.message);
																	})];
															case 2:
																sentMsg = _a.sent();
																if (!(msg.pinned && sentMsg)) return [3 /* break*/, 4];
																return [4 /* yield*/, sentMsg.pin()];
															case 3:
																_a.sent();
																_a.label = 4;
															case 4:
																_i++;
																return [3 /* break*/, 1];
															case 5:
																resolve(channel); // Return the channel
																return [2 /* return*/];
															}
														});
													});
												});
										} else {
											resolve(channel); // Return the channel
										}
										return [2 /* return*/];
									}
								});
							});
						});
						return [2 /* return*/];
					});
				});
			})];
		});
	});
}
exports.loadChannel = loadChannel;
/**
 * Delete all roles, all channels, all emojis, etc... of a guild
 */
function clearGuild(guild) {
	return __awaiter(this, void 0, void 0, function() {
		let webhooks, bans, integrations;
		return __generator(this, function(_a) {
			switch (_a.label) {
			case 0:
				guild.roles.cache
					.filter(function(role) { return !role.managed && role.editable && role.id !== guild.id; })
					.forEach(function(role) {
						role.delete().catch(function() { });
					});
				guild.channels.cache.forEach(function(channel) {
					channel.delete().catch(function() { });
				});
				guild.emojis.cache.forEach(function(emoji) {
					emoji.delete().catch(function() { });
				});
				return [4 /* yield*/, guild.fetchWebhooks()];
			case 1:
				webhooks = _a.sent();
				webhooks.forEach(function(webhook) {
					webhook.delete().catch(function() { });
				});
				return [4 /* yield*/, guild.fetchBans()];
			case 2:
				bans = _a.sent();
				bans.forEach(function(ban) {
					guild.members.unban(ban.user).catch(function() { });
				});
				return [4 /* yield*/, guild.fetchIntegrations()];
			case 3:
				integrations = _a.sent();
				integrations.forEach(function(integration) {
					integration.delete();
				});
				guild.setAFKChannel(null);
				guild.setAFKTimeout(60 * 5);
				guild.setIcon(null);
				guild.setBanner(null).catch(function() { });
				guild.setSplash(null).catch(function() { });
				guild.setDefaultMessageNotifications('MENTIONS');
				guild.setWidget({
					enabled: false,
					channel: null,
				});
				if (!guild.features.includes('COMMUNITY')) {
					guild.setExplicitContentFilter('DISABLED');
					guild.setVerificationLevel('NONE');
				}
				guild.setSystemChannel(null);
				guild.setSystemChannelFlags(['WELCOME_MESSAGE_DISABLED', 'BOOST_MESSAGE_DISABLED']);
				return [2 /* return*/];
			}
		});
	});
}
exports.clearGuild = clearGuild;
