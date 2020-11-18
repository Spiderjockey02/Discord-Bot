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
exports.embedChannel = exports.bans = exports.emojis = exports.afk = exports.channels = exports.roles = exports.conf = void 0;
const util_1 = require('./util');
/**
 * Restores the guild configuration
 */
function conf(guild, backupData) {
	return __awaiter(this, void 0, void 0, function() {
		let changeableExplicitLevel;
		return __generator(this, function(_a) {
			if (backupData.name) {
				guild.setName(backupData.name);
			}
			if (backupData.iconBase64) {
				guild.setIcon(Buffer.from(backupData.iconBase64, 'base64'));
			} else if (backupData.iconURL) {
				guild.setIcon(backupData.iconURL);
			}
			if (backupData.splashBase64) {
				guild.setSplash(Buffer.from(backupData.splashBase64, 'base64'));
			} else if (backupData.splashURL) {
				guild.setSplash(backupData.splashURL);
			}
			if (backupData.bannerBase64) {
				guild.setBanner(Buffer.from(backupData.bannerBase64, 'base64'));
			} else if (backupData.bannerURL) {
				guild.setBanner(backupData.bannerURL);
			}
			if (backupData.region) {
				guild.setRegion(backupData.region);
			}
			if (backupData.verificationLevel) {
				guild.setVerificationLevel(backupData.verificationLevel);
			}
			if (backupData.defaultMessageNotifications) {
				guild.setDefaultMessageNotifications(backupData.defaultMessageNotifications);
			}
			changeableExplicitLevel = guild.features.includes('COMMUNITY');
			if (backupData.explicitContentFilter && changeableExplicitLevel) {
				guild.setExplicitContentFilter(backupData.explicitContentFilter);
			}
			return [2 /* return*/];
		});
	});
}
exports.conf = conf;
/**
 * Restore the guild roles
 */
function roles(guild, backupData) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			backupData.roles.forEach(function(roleData) {
				guild.roles.create({
					// Create the role
					data: {
						name: roleData.name,
						color: roleData.color,
						hoist: roleData.hoist,
						permissions: roleData.permissions,
						mentionable: roleData.mentionable,
					},
				});
			});
			return [2 /* return*/];
		});
	});
}
exports.roles = roles;
/**
 * Restore the guild channels
 */
function channels(guild, backupData, options) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			backupData.channels.categories.forEach(function(categoryData) {
				util_1.loadCategory(categoryData, guild).then(function(createdCategory) {
					categoryData.children.forEach(function(channelData) {
						util_1.loadChannel(channelData, guild, createdCategory, options);
					});
				});
			});
			backupData.channels.others.forEach(function(channelData) {
				util_1.loadChannel(channelData, guild, null, options);
			});
			return [2 /* return*/];
		});
	});
}
exports.channels = channels;
/**
 * Restore the afk configuration
 */
function afk(guild, backupData) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			if (backupData.afk) {
				guild.setAFKChannel(guild.channels.cache.find(function(ch) { return ch.name === backupData.afk.name; }));
				guild.setAFKTimeout(backupData.afk.timeout);
			}
			return [2 /* return*/];
		});
	});
}
exports.afk = afk;
/**
 * Restore guild emojis
 */
function emojis(guild, backupData) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			backupData.emojis.forEach(function(emoji) {
				if (emoji.url) {
					guild.emojis.create(emoji.url, emoji.name);
				} else if (emoji.base64) {
					guild.emojis.create(Buffer.from(emoji.base64, 'base64'), emoji.name);
				}
			});
			return [2 /* return*/];
		});
	});
}
exports.emojis = emojis;
/**
 * Restore guild bans
 */
function bans(guild, backupData) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			backupData.bans.forEach(function(ban) {
				guild.members.ban(ban.id, {
					reason: ban.reason,
				});
			});
			return [2 /* return*/];
		});
	});
}
exports.bans = bans;
/**
 * Restore embedChannel configuration
 */
function embedChannel(guild, backupData) {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			if (backupData.widget.channel) {
				guild.setWidget({
					enabled: backupData.widget.enabled,
					channel: guild.channels.cache.find(function(ch) { return ch.name === backupData.widget.channel; }),
				});
			}
			return [2 /* return*/];
		});
	});
}
exports.embedChannel = embedChannel;
