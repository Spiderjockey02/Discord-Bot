# CHANGE LOG

## November 2<sup>nd</sup>
* Removed `commands/Host/debug.js`.
* Removed `commands/Host/suggestion.js`.
* Added new `docs/.`.
* Updated `commands/Host/eval.js`.
* Updated `commands/Image/image.js`.
* Updated file system.

## November 1<sup>st</sup>

* Added debug option on `events/.js`
* Added `commands/Misc/privacy.js`.
* Updated `commands/guild/giveaway.js`.
* Updated `modules/database/mongoose.js`

## October 31<sup>st</sup>
* Updated README.md

## October 30<sup>th</sup>
* Updated image commands to include emojis in bot.getImage()
* Added botlist.space API support
* Added arcane-center.xyz API support

## October 29<sup>th</sup>
* Cleaned up some files.
* Fixed timed commands 'freezing' the bot.
* Fixed descriptions on some commands.
* Updated Level plugin to follow a formula instead of just 50XP each level. `(5 * (Level ** 2) + 50 * Level + 100)`
* Updated bot.getImage() to force user avatar to be '.png'.
* Updated dependencies.

## October 28<sup>th</sup>
* Updated `commands/Fun/fact.js`
* Updated `README.md`
* Added `@someone` feature
* Added @dependabot to repo for automatic  package updates.
* Added `docs/COMMANDS.md`

## October 27<sup>th</sup>
* Re-structed & cleaned the Repo to look better.
* Updated `command/Host/eval.js` (to create accurate execution time)
* Updated bot.js

## October 26<sup>th</sup> ([8a46bb8](https://github.com/Spiderjockey02/Discord-Bot/commit/8a46bb8506e965c478190a114548b53b28028927), [2b84d41](https://github.com/Spiderjockey02/Discord-Bot/commit/2b84d4150546b4833b6efcaa3844c77ad1b96304), [1997a2c](https://github.com/Spiderjockey02/Discord-Bot/commit/2b84d4150546b4833b6efcaa3844c77ad1b96304))
* Fixed event `guildUpdate`.
* Update guildName in database if guild name changed.
* Fixed moderation commands so moderator can't punish themselves.
* Added global function bot.getUser() as a lot of commands wanted a user parameter.

## October 23<sup>rd</sup> ([5a4a803](https://github.com/Spiderjockey02/Discord-Bot/commit/5a4a8035d8c04cc44c157bc41c834e20bed6348f))
* Showed error message if the bot was unable to kick user.
* Made sure that if auto-mod punished user, level plugin would not award XP for message.
* Fixed bug so that it now shows the bot warned the user (if auto-mod activated) and not the message author (offender).

## October 20<sup>th</sup>
* Added option so moderators can choose to delete moderator commands or not after use.
* New guild settings (sneak peak for website)

## October 19<sup>th</sup>
* Fixed up console load up.
* Updated list of guild only plugins in `events/message.js`.
* Add option to see active plugins in `commands/Misc/help.js`.
* Allowed to see music queue in `commands/Host/eval.js`.

## October 18<sup>th</sup>
* Added PRIVACY.md
* Added FUNDING.yml

## October 13<sup>th</sup>
* Updated `commands/Misc/help.js`.

## October 12<sup>th</sup>
* Added `commands/Moderation/clear-warning.js`.
* Updated warning system.
* Changed warning database to include moderator.

## October 10<sup>th</sup>
* Fixed plugin duplication bug.

## October 8<sup>th</sup>
* Updated emoji check.
* Added CHANGELOG.md.
* Added bot.Stats (to see MessageSent, Giveaways, BannedUsers, CommandsUsed).
* Added NSFW channel check to `events/message.js`.
* Added `commands/Image`.
* Added `commands/Moderation`.
* Added `commands/NSFW`.
* Added global function bot.musicHandler() for `commands/Music`.
* Fixed bug so music settings don't reset.
* Fixed up commands usage to follow a formula (<> - required, [] - optional)
* Changed `utils/play.js` to `utils/AudioPlayer.js`
* Changed `utils/guild-settings` to `utils/global-functions.js`
