exports.LastChanceOptions = {
	enabled: false,
	content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
	threshold: 5000,
	embedColor: '#FF0000',
};

/**
 * The pause options.
 * @typedef PauseOptions
 *
 * @property {boolean} [isPaused=false] If the giveaway is paused.
 * @property {string} [content='⚠️ **THIS GIVEAWAY IS PAUSED !** ⚠️'] The text of the embed when the giveaway is paused.
 * @property {number} [unPauseAfter=null] The number of milliseconds after which the giveaway will automatically unpause.
 * @property {Discord.EmbedColorResolveAble} [embedColor='#FFFF00'] The color of the embed when the giveaway is paused.
 * @private @property {number} [durationAfterPause=null|giveaway.remainingTime] The remaining duration after the giveaway is unpaused. ⚠ This property gets set by the manager so that the pause system works properly. It is not recommended to set it manually!
 * @property {string} [infiniteDurationText='`NEVER`'] The text that gets displayed next to "GiveawayMessages#drawing" in the paused embed, when there is no "unPauseAfter".
 */
exports.PauseOptions = {
	isPaused: false,
	content: '⚠️ **THIS GIVEAWAY IS PAUSED !** ⚠️',
	unPauseAfter: null,
	embedColor: '#FFFF00',
	durationAfterPause: null,
	infiniteDurationText: '`NEVER`',
};
